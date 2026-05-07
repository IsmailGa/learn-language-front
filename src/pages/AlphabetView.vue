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

const vowels     = computed(() => characters.value.filter(c => c.type === 'vowel'))
const consonants = computed(() => characters.value.filter(c => c.type === 'consonant'))

const predictUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/v1/predict/`
</script>

<template>
  <div class="min-h-screen" style="background: hsl(var(--background))">

    <!-- Header -->
    <header class="sticky top-0 z-40 glass border-b border-border/60 shadow-sm">
      <div class="px-4 py-4 container-fluid">
        <h1 class="font-black text-foreground" style="font-size: clamp(1.375rem, 3vw, 2rem); letter-spacing: -0.02em">
          {{ t('alphabet.title') }}
        </h1>
        <p class="text-muted-foreground text-sm mt-0.5 font-medium">{{ t('alphabet.draw_title') }}</p>
      </div>
    </header>

    <div class="container-fluid py-6 bottom-nav-offset max-w-4xl space-y-10">

      <!-- Skeleton -->
      <div v-if="isLoading" class="space-y-8">
        <div v-for="i in 2" :key="i" class="space-y-4">
          <Skeleton class="h-7 w-36 rounded-xl" />
          <div class="grid grid-cols-4 xs:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <Skeleton v-for="j in 10" :key="j" class="aspect-square rounded-2xl" />
          </div>
        </div>
      </div>

      <div v-else-if="characters.length > 0" class="space-y-10">

        <!-- Vowels -->
        <section v-if="vowels.length > 0">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="font-black text-foreground" style="font-size: clamp(1.125rem, 2vw, 1.375rem)">
              {{ t('alphabet.vowels') }}
            </h2>
            <span class="badge" style="background: hsl(var(--primary) / 0.1); color: hsl(var(--primary))">
              {{ vowels.length }}
            </span>
          </div>
          <div class="grid grid-cols-4 xs:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <button
              v-for="char in vowels"
              :key="char.id"
              @click="openDraw(char)"
              class="char-card group"
              :style="{ '--hover-color': 'hsl(var(--primary))' }"
            >
              <span class="char-glyph">{{ char.character }}</span>
              <span class="char-roman">{{ char.transliteration }}</span>
              <Pencil class="char-pencil" />
            </button>
          </div>
        </section>

        <!-- Consonants -->
        <section v-if="consonants.length > 0">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="font-black text-foreground" style="font-size: clamp(1.125rem, 2vw, 1.375rem)">
              {{ t('alphabet.consonants') }}
            </h2>
            <span class="badge" style="background: hsl(var(--success) / 0.1); color: hsl(var(--success))">
              {{ consonants.length }}
            </span>
          </div>
          <div class="grid grid-cols-4 xs:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <button
              v-for="char in consonants"
              :key="char.id"
              @click="openDraw(char)"
              class="char-card char-card--success group"
              :style="{ '--hover-color': 'hsl(var(--success))' }"
            >
              <span class="char-glyph">{{ char.character }}</span>
              <span class="char-roman">{{ char.transliteration }}</span>
              <Pencil class="char-pencil" />
            </button>
          </div>
        </section>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center h-64 text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style="background: hsl(var(--muted))">
          <span class="text-3xl">🔤</span>
        </div>
        <h3 class="font-black text-foreground text-lg mb-1">Алфавит пуст</h3>
        <p class="text-muted-foreground text-sm max-w-xs">Символы для этого курса пока не добавлены.</p>
      </div>
    </div>

    <!-- Drawing Drawer -->
    <Transition name="drawer">
      <div v-if="selectedChar" class="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDraw" />

        <!-- Panel -->
        <div class="drawer-panel relative z-10 w-full md:w-auto md:min-w-[380px] md:max-w-[440px]
          rounded-t-3xl md:rounded-3xl px-6 pt-6 pb-10 md:p-8 shadow-2xl"
          style="background: hsl(var(--card))">

          <!-- Drag handle (mobile) -->
          <div class="w-10 h-1 rounded-full mx-auto mb-5 md:hidden"
            style="background: hsl(var(--border))" />

          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                {{ t('alphabet.draw_title') }}
              </p>
              <div class="flex items-baseline gap-2">
                <span class="font-black text-foreground"
                  style="font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -0.02em; line-height: 1">
                  {{ selectedChar.character }}
                </span>
                <span class="text-xl font-bold text-muted-foreground">
                  {{ selectedChar.transliteration }}
                </span>
              </div>
            </div>
            <button
              @click="closeDraw"
              class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style="background: hsl(var(--muted))"
            >
              <X class="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p class="text-sm text-muted-foreground mb-4 text-center font-medium">
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
/* ── Character Cards ─────────────────────────────────────────── */
.char-card {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: hsl(var(--card));
  border: 2px solid hsl(var(--border) / 0.7);
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 150ms, background 150ms, transform 120ms, box-shadow 150ms;
  box-shadow: var(--shadow-sm);
  outline: none;
  gap: 2px;
}

.char-card:active {
  transform: scale(0.92);
}

@media (hover: hover) {
  .char-card:hover {
    border-color: hsl(var(--primary) / 0.5);
    background: hsl(var(--primary) / 0.04);
    box-shadow: 0 4px 12px hsl(var(--primary) / 0.12);
  }
  .char-card--success:hover {
    border-color: hsl(var(--success) / 0.5);
    background: hsl(var(--success) / 0.04);
    box-shadow: 0 4px 12px hsl(var(--success) / 0.12);
  }
  .char-card:hover .char-glyph { color: hsl(var(--primary)); }
  .char-card--success:hover .char-glyph { color: hsl(var(--success)); }
  .char-card:hover .char-pencil { opacity: 1; }
}

.char-glyph {
  font-size: 1.875rem;
  font-weight: 900;
  color: hsl(var(--foreground));
  line-height: 1;
  transition: color 150ms;
}

.char-roman {
  font-size: 9px;
  font-weight: 800;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.07em;
  transition: color 150ms;
}

.char-pencil {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 12px;
  height: 12px;
  color: hsl(var(--muted-foreground));
  opacity: 0;
  transition: opacity 150ms;
}

/* ── Drawer Transition ───────────────────────────────────────── */
.drawer-enter-active {
  transition: opacity 0.25s ease;
}
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-active .drawer-panel {
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
