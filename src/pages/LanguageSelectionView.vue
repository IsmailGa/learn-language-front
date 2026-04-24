<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { SUPPORTED_LOCALES, type LocaleCode } from '@/i18n'
import api from '@/api/axios'
import { getFlagCode } from '@/utils/flags'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import WebApp from '@twa-dev/sdk'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

// ── Шаг 1: выбор родного языка (= язык интерфейса)
// Шаг 2: выбор изучаемого языка (= курс)

type Step = 'native' | 'target'
const step = ref<Step>('native')
const selectedLocale = ref<LocaleCode | null>(null)
const sourceLangCode  = ref<string | null>(null) // код языка (ru/en/uz)

// ── Курсы ─────────────────────────────────────────────────────────────────
interface CourseItem {
  id: string
  title: string
  description: string
  source_lang: { code: string; native_name: string; name: string }
  target_lang: { code: string; native_name: string; name: string }
}

const allCourses    = ref<CourseItem[]>([])
const isLoadingData = ref(false)
const selectingId   = ref<string | null>(null)

// Курсы для выбранного родного языка
const filteredCourses = computed(() =>
  allCourses.value.filter(c => c.source_lang.code === sourceLangCode.value)
)

onMounted(async () => {
  isLoadingData.value = true
  try {
    const res = await api.get('/v1/courses')
    allCourses.value = res.data
  } finally {
    isLoadingData.value = false
  }
})

// ── Шаг 1: пользователь выбрал родной язык ───────────────────────────────
const pickNativeLang = (locale: LocaleCode, langCode: string) => {
  try { WebApp.HapticFeedback.impactOccurred('light') } catch { }

  // Сразу меняем язык интерфейса — теперь кнопки/заголовки переключатся
  userStore.setLocale(locale)
  selectedLocale.value = locale
  sourceLangCode.value  = langCode

  step.value = 'target'
}

// ── Шаг 2: пользователь выбрал, что учить ───────────────────────────────
const pickCourse = async (courseId: string) => {
  if (selectingId.value) return
  try {
    selectingId.value = courseId
    try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
    await userStore.selectCourse(courseId)
    router.push('/')
  } catch (e) {
    console.error('Select course failed', e)
  } finally {
    selectingId.value = null
  }
}

const goBack = () => {
  if (step.value === 'target') {
    step.value = 'native'
    selectedLocale.value = null
    sourceLangCode.value  = null
  } else {
    router.back()
  }
}

const isCurrentCourse = (id: string) => userStore.user?.current_course_id === id
const canGoBack = computed(() => step.value === 'target' || !!userStore.user?.current_course_id)

// Маппинг locale → код языка в БД (code поля Language)
const localeToLangCode: Record<LocaleCode, string> = {
  ru: 'ru',
  en: 'en',
  uz: 'uz',
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 md:pb-0">

    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div class="flex items-center gap-3 px-4 h-14 max-w-3xl mx-auto">
        <button
          v-if="canGoBack"
          @click="goBack"
          class="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
        >
          <ChevronLeft class="w-5 h-5 text-slate-600" />
        </button>

        <!-- Прогресс-индикатор -->
        <div class="flex items-center gap-2 flex-1">
          <div :class="['h-1.5 flex-1 rounded-full transition-all duration-300', step === 'native' ? 'bg-primary' : 'bg-primary']" />
          <div :class="['h-1.5 flex-1 rounded-full transition-all duration-300', step === 'target' ? 'bg-primary' : 'bg-slate-200']" />
        </div>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-4 py-10">

      <!-- ════════════════════════════════════════════════════════════
           ШАГ 1 — Родной язык (= язык интерфейса)
      ════════════════════════════════════════════════════════════ -->
      <Transition name="step" mode="out-in">
        <div v-if="step === 'native'" key="native" class="space-y-8">

          <!-- Заголовок -->
          <div class="text-center space-y-2">
            <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">👋</span>
            </div>
            <h1 class="text-2xl font-extrabold text-slate-800">На каком языке вам удобнее?</h1>
            <p class="text-slate-500 text-sm">Выберите ваш родной язык — интерфейс переключится автоматически</p>
          </div>

          <!-- Карточки языков -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              v-for="locale in SUPPORTED_LOCALES"
              :key="locale.code"
              @click="pickNativeLang(locale.code as LocaleCode, localeToLangCode[locale.code as LocaleCode])"
              class="group relative flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-primary/50 hover:shadow-lg active:scale-95 transition-all duration-200 text-left"
            >
              <!-- Флаг -->
              <span
                :class="['fi', 'fi-' + locale.flag, 'text-5xl rounded-lg shadow-sm block']"
                style="line-height:1"
              ></span>

              <!-- Названия -->
              <div class="text-center">
                <p class="font-bold text-slate-800 text-base">{{ locale.label }}</p>
              </div>

              <!-- Стрелка -->
              <ChevronRight class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
            </button>
          </div>

        </div>

        <!-- ════════════════════════════════════════════════════════════
             ШАГ 2 — Что хотим изучать
        ════════════════════════════════════════════════════════════ -->
        <div v-else-if="step === 'target'" key="target" class="space-y-8">

          <!-- Заголовок с выбранным флагом -->
          <div class="text-center space-y-2">
            <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">📚</span>
            </div>
            <h1 class="text-2xl font-extrabold text-slate-800">{{ t('select_language.title') }}</h1>
            <p class="text-slate-500 text-sm">{{ t('select_language.subtitle') }}</p>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingData" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton v-for="i in 2" :key="i" class="h-36 rounded-2xl" />
          </div>

          <!-- Нет курсов для этого языка -->
          <div v-else-if="filteredCourses.length === 0" class="text-center py-12 space-y-4">
            <p class="text-slate-500">Для выбранного языка пока нет доступных курсов.</p>
            <button
              @click="step = 'native'"
              class="text-primary font-semibold hover:underline text-sm transition-colors"
            >
              ← Выбрать другой язык
            </button>
          </div>

          <!-- Карточки курсов -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              v-for="course in filteredCourses"
              :key="course.id"
              @click="pickCourse(course.id)"
              :disabled="!!selectingId"
              :class="[
                'group relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-200',
                'hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full',
                isCurrentCourse(course.id)
                  ? 'border-primary shadow-md bg-primary/5'
                  : 'border-slate-200 bg-white hover:border-primary/50'
              ]"
            >
              <!-- Цветная upper stripe -->
              <div class="h-2 bg-gradient-to-r from-primary to-blue-500 w-full" />

              <div class="p-6 flex flex-col gap-3">
                <!-- Флаг изучаемого языка — большой -->
                <div class="flex items-center gap-3">
                  <span
                    :class="['fi', 'fi-' + getFlagCode(course.target_lang.code), 'text-4xl rounded-md shadow-sm shrink-0']"
                    style="line-height:1"
                  ></span>
                  <div class="min-w-0">
                    <h3 class="font-extrabold text-slate-800 text-xl leading-tight">{{ course.target_lang.native_name }}</h3>
                    <p class="text-xs text-slate-400 font-medium">{{ course.title }}</p>
                  </div>
                  <!-- Текущий бейдж -->
                  <span
                    v-if="isCurrentCourse(course.id)"
                    class="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0"
                  >
                    <CheckCircle2 class="w-3 h-3" />
                    Выбран
                  </span>
                </div>

                <!-- Описание -->
                <p class="text-sm text-slate-500 line-clamp-2">
                  {{ course.description || `Изучайте ${course.target_lang.native_name} с нуля` }}
                </p>

                <!-- Кнопка -->
                <div class="mt-1 flex items-center justify-end">
                  <div :class="[
                    'inline-flex items-center gap-1.5 font-bold text-sm rounded-xl px-4 py-2 transition-all',
                    isCurrentCourse(course.id)
                      ? 'bg-primary/10 text-primary'
                      : 'bg-primary text-white group-hover:bg-primary/90'
                  ]">
                    <Loader2 v-if="selectingId === course.id" class="w-4 h-4 animate-spin" />
                    <CheckCircle2 v-else-if="isCurrentCourse(course.id)" class="w-4 h-4" />
                    <ArrowRight v-else class="w-4 h-4" />
                    {{ isCurrentCourse(course.id) ? t('select_language.choose') + 'd' : t('select_language.choose') }}
                  </div>
                </div>
              </div>
            </button>
          </div>

        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
