<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import WebApp from '@twa-dev/sdk'
import api from '@/api/axios'
import { useUserStore } from '@/stores/user'
import DrawingCanvas from '@/components/DrawingCanvas.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, X } from 'lucide-vue-next'

const { t } = useI18n()
const userStore = useUserStore()

const isLoading = ref(true)
const characters = ref<any[]>([])

// ── Drawer для рисования символа ───────────────────────────────────────────
const selectedChar = ref<any | null>(null)
const canvasRef = ref<InstanceType<typeof DrawingCanvas> | null>(null)

const openDraw = (char: any) => {
  selectedChar.value = char
  try { WebApp.HapticFeedback.impactOccurred('light') } catch { }
}

const closeDraw = () => {
  selectedChar.value = null
  canvasRef.value?.clearCanvas()
}

const handleResult = (data: { predicted: string; confidence: number; correct: boolean }) => {
  try {
    if (data.correct) WebApp.HapticFeedback.notificationOccurred('success')
    else WebApp.HapticFeedback.notificationOccurred('error')
  } catch { }
}

onMounted(async () => {
  isLoading.value = true
  try {
    const courseId = userStore.user?.current_course_id
    if (courseId) {
      const res = await api.get(`/v1/courses/${courseId}/characters`)
      characters.value = res.data
    } else {
      const coursesRes = await api.get('/v1/courses')
      if (coursesRes.data?.length > 0) {
        const res = await api.get(`/v1/courses/${coursesRes.data[0].id}/characters`)
        characters.value = res.data
      }
    }
  } catch (e) {
    console.error('Failed to load characters', e)
  } finally {
    isLoading.value = false
  }
})

const vowels    = computed(() => characters.value.filter(c => c.type === 'vowel'))
const consonants = computed(() => characters.value.filter(c => c.type === 'consonant'))

// Backend URL для распознавания
const predictUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/v1/predict/`
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24 md:pb-0">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div class="px-4 py-4 max-w-3xl mx-auto">
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">{{ t('alphabet.title') }}</h1>
        <p class="text-slate-400 text-sm mt-0.5">{{ t('alphabet.draw_title') }}</p>
      </div>
    </header>

    <div class="px-4 py-6 max-w-3xl mx-auto space-y-10">

      <!-- Skeleton Loading -->
      <div v-if="isLoading" class="space-y-8">
        <div v-for="i in 2" :key="i" class="space-y-4">
          <Skeleton class="h-7 w-32" />
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
            <Skeleton v-for="j in 8" :key="j" class="aspect-square rounded-2xl" />
          </div>
        </div>
      </div>

      <div v-else-if="characters.length > 0" class="space-y-10">

        <!-- Гласные / Vowels -->
        <section v-if="vowels.length > 0">
          <h2 class="text-lg font-extrabold text-slate-700 mb-4 flex items-center gap-2">
            {{ t('alphabet.vowels') }}
            <span class="px-2 py-0.5 bg-sky-100 text-sky-600 rounded-full text-xs font-bold">{{ vowels.length }}</span>
          </h2>
          <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <button
              v-for="char in vowels"
              :key="char.id"
              @click="openDraw(char)"
              class="aspect-square flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-2xl hover:border-sky-400 hover:bg-sky-50 active:scale-95 transition-all shadow-sm group relative"
            >
              <span class="text-3xl font-black text-slate-800 group-hover:text-sky-600 transition-colors mb-0.5">
                {{ char.character }}
              </span>
              <span class="text-[10px] font-bold text-slate-400 group-hover:text-sky-500 uppercase tracking-wider">
                {{ char.transliteration }}
              </span>
              <!-- Иконка-подсказка -->
              <Pencil class="absolute top-1 right-1 w-3 h-3 text-slate-300 group-hover:text-sky-400 transition-colors" />
            </button>
          </div>
        </section>

        <!-- Согласные / Consonants -->
        <section v-if="consonants.length > 0">
          <h2 class="text-lg font-extrabold text-slate-700 mb-4 flex items-center gap-2">
            {{ t('alphabet.consonants') }}
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">{{ consonants.length }}</span>
          </h2>
          <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <button
              v-for="char in consonants"
              :key="char.id"
              @click="openDraw(char)"
              class="aspect-square flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 active:scale-95 transition-all shadow-sm group relative"
            >
              <span class="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors mb-0.5">
                {{ char.character }}
              </span>
              <span class="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500 uppercase tracking-wider">
                {{ char.transliteration }}
              </span>
              <Pencil class="absolute top-1 right-1 w-3 h-3 text-slate-300 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </section>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-64 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <span class="text-3xl">🔤</span>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Алфавит пуст</h3>
        <p class="text-slate-500 max-w-xs text-sm">Символы для этого курса пока не добавлены.</p>
      </div>

    </div>

    <!-- ──────────── DRAWER: Рисование символа ──────────── -->
    <Transition name="drawer">
      <div
        v-if="selectedChar"
        class="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDraw" />

        <!-- Панель -->
        <div class="relative z-10 bg-white w-full md:w-auto md:min-w-[360px] rounded-t-3xl md:rounded-3xl px-6 pt-6 pb-10 md:p-6 shadow-2xl">
          <!-- Заголовок -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ t('alphabet.draw_title') }}</p>
              <h2 class="text-3xl font-black text-slate-800 leading-none mt-0.5">
                {{ selectedChar.character }}
                <span class="text-xl text-slate-400 font-bold ml-2">{{ selectedChar.transliteration }}</span>
              </h2>
            </div>
            <button
              @click="closeDraw"
              class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            >
              <X class="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <p class="text-sm text-slate-500 mb-4 text-center">
            {{ t('alphabet.draw_prompt', { char: selectedChar.character }) }}
          </p>

          <!-- Canvas -->
          <DrawingCanvas
            ref="canvasRef"
            :api-endpoint="predictUrl"
            :expected-char="selectedChar.character"
            :line-width="18"
            :show-buttons="true"
            @result="handleResult"
            @continue="closeDraw"
            class="mx-auto"
          />
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active .relative,
.drawer-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
