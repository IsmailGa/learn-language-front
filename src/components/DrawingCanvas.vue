<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircle, XCircle, Loader2, Eraser, Send, RotateCcw } from 'lucide-vue-next'

// ─── Props & Emits ──────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  /** Если задан — submitImage уходит через API прямо отсюда. Иначе — emit('submit', base64). */
  apiEndpoint?: string
  /** Ожидаемый символ для подсветки правильного/неправильного ответа */
  expectedChar?: string
  /** Толщина линии (по умолчанию 18px — оптимально для ML) */
  lineWidth?: number
  /** Показывать ли нижние кнопки */
  showButtons?: boolean
}>(), {
  lineWidth: 18,
  showButtons: true,
})

const emit = defineEmits<{
  submit: [base64: string]
  result: [data: { predicted: string; confidence: number; correct: boolean }]
  continue: []
}>()

// ─── i18n ───────────────────────────────────────────────────────────────────
const { t } = useI18n()

// ─── Состояния ──────────────────────────────────────────────────────────────
type CanvasState = 'idle' | 'drawing' | 'checking' | 'correct' | 'wrong'
const state = ref<CanvasState>('idle')
const predicted = ref('')
const confidence = ref(0)

const borderClass = computed(() => {
  if (state.value === 'correct') return 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
  if (state.value === 'wrong') return 'border-red-500   shadow-[0_0_20px_rgba(239,68,68,0.4)]'
  if (state.value === 'drawing') return 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]'
  return 'border-slate-200 shadow-inner'
})

// ─── Canvas ─────────────────────────────────────────────────────────────────
const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let isDrawing = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Размер canvas — квадрат, ограниченный шириной контейнера (макс 320px)
const canvasSize = ref(280)

function resizeCanvas() {
  if (!containerRef.value) return
  const w = Math.min(containerRef.value.clientWidth, 320)
  canvasSize.value = w
  // После resize нужно перерисовать чёрный фон (canvas сбрасывается при смене размера)
  requestAnimationFrame(() => {
    if (canvasRef.value && ctx) fillBackground()
  })
}

const resizeObserver = new ResizeObserver(resizeCanvas)

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    if (ctx) fillBackground()
  }
  if (containerRef.value) resizeObserver.observe(containerRef.value)
  resizeCanvas()
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
  if (debounceTimer) clearTimeout(debounceTimer)
})

// ─── Рисование ──────────────────────────────────────────────────────────────
function fillBackground() {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#ffffff' // white background
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

function clearCanvas() {
  if (!canvasRef.value || !ctx) return
  fillBackground()
  state.value = 'idle'
  predicted.value = ''
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
}

function getCoordinates(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  // Масштаб: если canvas CSS size отличается от logical size
  const scaleX = canvasRef.value.width / rect.width
  const scaleY = canvasRef.value.height / rect.height

  let clientX: number, clientY: number
  if (e instanceof MouseEvent) {
    clientX = e.clientX; clientY = e.clientY
  } else if (window.TouchEvent && e instanceof TouchEvent && e.touches.length > 0) {
    clientX = e.touches[0].clientX; clientY = e.touches[0].clientY
  } else {
    return { x: 0, y: 0 }
  }
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function startDrawingBase(x: number, y: number) {
  isDrawing = true
  state.value = 'drawing'
  if (!ctx) return
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.strokeStyle = '#000000' // black stroke
  ctx.lineWidth = props.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineTo(x, y)
  ctx.stroke()
  scheduleAutoSubmit()
}

function drawBase(x: number, y: number) {
  if (!isDrawing || !ctx) return
  ctx.lineTo(x, y)
  ctx.stroke()
  scheduleAutoSubmit()
}

function stopDrawingBase() {
  isDrawing = false
  if (ctx) ctx.beginPath()
}

const startDrawing = (e: MouseEvent) => { const { x, y } = getCoordinates(e); startDrawingBase(x, y) }
const draw = (e: MouseEvent) => { if (!isDrawing) return; const { x, y } = getCoordinates(e); drawBase(x, y) }
const startDrawingTouch = (e: TouchEvent) => { e.preventDefault(); const { x, y } = getCoordinates(e); startDrawingBase(x, y) }
const drawTouch = (e: TouchEvent) => { if (!isDrawing) return; e.preventDefault(); const { x, y } = getCoordinates(e); drawBase(x, y) }
const stopDrawing = () => stopDrawingBase()

// ─── Debounce авто-отправки (опционально) ────────────────────────────────────
function scheduleAutoSubmit() {
  // Авто-отправка отключена — пользователь нажимает «Проверить» вручную
  // Можно включить раскомментировав код ниже:
  // if (debounceTimer) clearTimeout(debounceTimer)
  // debounceTimer = setTimeout(() => submitImage(), 2000)
}

// ─── Отправка на backend ─────────────────────────────────────────────────────
async function submitImage() {
  if (!canvasRef.value) return
  const base64 = canvasRef.value.toDataURL('image/png')

  // Если нет endpoint — просто emit для родителя
  if (!props.apiEndpoint) {
    emit('submit', base64)
    return
  }

  state.value = 'checking'
  try {
    const response = await fetch(props.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    })
    if (!response.ok) throw new Error('Network error')
    const data = await response.json()
    predicted.value = data.prediction ?? data.predicted_class ?? data.character ?? ''
    confidence.value = Math.round((data.confidence ?? 0) * 100)

    const isCorrect = props.expectedChar
      ? predicted.value.toLowerCase().normalize('NFKD') === props.expectedChar.toLowerCase().normalize('NFKD')
      : true

    state.value = isCorrect ? 'correct' : 'wrong'
    emit('result', { predicted: predicted.value, confidence: confidence.value, correct: isCorrect })
  } catch (err) {
    console.error('Predict error:', err)
    state.value = 'wrong'
  }
}

// Экспортируем методы для использования из родителя через ref
defineExpose({ clearCanvas, submitImage })
</script>

<template>
  <div ref="containerRef" class="flex flex-col items-center gap-3 w-full">

    <!-- Canvas-обёртка -->
    <div :class="[
      'relative rounded-2xl overflow-hidden touch-none border-4 transition-all duration-500',
      borderClass
    ]" :style="{ width: `${canvasSize}px`, height: `${canvasSize}px` }">
      <canvas ref="canvasRef" :width="canvasSize" :height="canvasSize" class="block w-full h-full"
        style="cursor: crosshair" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing"
        @mouseleave="stopDrawing" @touchstart.passive="startDrawingTouch" @touchmove.passive="drawTouch"
        @touchend="stopDrawing" />

      <!-- Лоадер поверх canvas -->
      <Transition name="fade-overlay">
        <div v-if="state === 'checking'"
          class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
          <Loader2 class="w-10 h-10 text-primary animate-spin" />
          <span class="text-slate-700 text-sm font-medium">{{ t('canvas.checking') }}</span>
        </div>
      </Transition>

      <!-- Результат overlay -->
      <Transition name="fade-overlay">
        <div v-if="state === 'correct' || state === 'wrong'" :class="[
          'absolute bottom-0 inset-x-0 flex items-center gap-2 px-4 py-2',
          state === 'correct' ? 'bg-emerald-500/90' : 'bg-red-500/90'
        ]">
          <CheckCircle v-if="state === 'correct'" class="w-5 h-5 text-white shrink-0" />
          <XCircle v-else class="w-5 h-5 text-white shrink-0" />
          <span class="text-white text-sm font-semibold">
            <template v-if="state === 'correct'">
              {{ t('canvas.correct', { char: predicted }) }}
            </template>
            <template v-else>
              {{ t('canvas.wrong_simple', 'Неверный символ') }}
            </template>
          </span>

        </div>
      </Transition>
    </div>

    <!-- Кнопки -->
    <div v-if="showButtons" class="flex gap-3 w-full" :style="{ maxWidth: `${canvasSize}px` }">
      <button @click="clearCanvas"
        class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 transition-all text-slate-600 font-semibold text-sm shadow-sm">
        <Eraser class="w-4 h-4" />
        {{ t('canvas.clear') }}
      </button>

      <button v-if="state === 'correct'" @click="emit('continue')"
        class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-semibold text-sm shadow-md">
        {{ t('canvas.continue', 'Дальше') }}
      </button>

      <button v-else @click="submitImage" :disabled="state === 'checking'"
        class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 active:scale-95 transition-all text-white font-semibold text-sm shadow-md">
        <Loader2 v-if="state === 'checking'" class="w-4 h-4 animate-spin" />
        <Send v-else class="w-4 h-4" />
        {{ state === 'checking' ? t('canvas.checking') : t('canvas.submit') }}
      </button>

      <button v-if="state === 'correct' || state === 'wrong'" @click="clearCanvas"
        class="flex items-center justify-center w-12 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 transition-all text-slate-600 shadow-sm">
        <RotateCcw class="w-4 h-4" />
      </button>
    </div>

  </div>
</template>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>