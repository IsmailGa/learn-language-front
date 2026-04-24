<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import WebApp from '@twa-dev/sdk'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserStore } from '@/stores/user'
import api from '@/api/axios'
import { getFlagCode } from '@/utils/flags'
import {
  Star, Flame, Trophy, Heart, Globe, Crown,
  Target, BookOpen, TrendingUp, User, CheckCircle2, RefreshCw
} from 'lucide-vue-next'
import type { Component } from 'vue'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const currentStreak = computed(() => userStore.user?.streak || 0)
const totalXp       = computed(() => userStore.user?.xp || 0)
const hearts        = computed(() => userStore.user?.hearts ?? 5)
const bestStreak    = computed(() => Math.max(currentStreak.value, 0))

const currentCourse  = ref<any>(null)
const isLoadingCourse = ref(false)

const stats = computed(() => [
  { label: 'Всего XP',      value: totalXp.value,      icon: Star    as Component, color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-100' },
  { label: 'Серия',         value: currentStreak.value, icon: Flame   as Component, color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-100' },
  { label: 'Лучшая серия',  value: bestStreak.value,    icon: Trophy  as Component, color: 'text-emerald-500',bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'Жизни',         value: hearts.value,        icon: Heart   as Component, color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100' },
])

const achievements: { id: number; title: string; icon: Component; unlocked: boolean; desc: string }[] = [
  { id: 1, title: 'Первые шаги',    icon: Target   as Component, unlocked: true,  desc: 'Завершил первый урок' },
  { id: 2, title: 'Неделя силы',    icon: Flame    as Component, unlocked: true,  desc: '7 дней подряд' },
  { id: 3, title: 'Знаток хангыля', icon: BookOpen as Component, unlocked: true,  desc: 'Выучил алфавит' },
  { id: 4, title: 'Полиглот',       icon: Globe    as Component, unlocked: false, desc: 'Достигни 1000 XP' },
  { id: 5, title: 'Месяц успеха',   icon: Star     as Component, unlocked: false, desc: '30 дней подряд' },
  { id: 6, title: 'Мастер',         icon: Crown    as Component, unlocked: false, desc: 'Завершил все уроки' },
]

const fetchCurrentCourse = async () => {
  if (!userStore.user?.current_course_id) return
  isLoadingCourse.value = true
  try {
    const res = await api.get(`/v1/courses/${userStore.user.current_course_id}`)
    currentCourse.value = res.data
  } catch (e) {
    console.error('Failed to fetch course', e)
  } finally {
    isLoadingCourse.value = false
  }
}

onMounted(() => { fetchCurrentCourse() })

const refreshProfile = async () => {
  try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
  await userStore.fetchProfile(true)
  await fetchCurrentCourse()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24 md:pb-0">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div class="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">{{ t('profile.title') }}</h1>
        <button
          @click="refreshProfile"
          class="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <RefreshCw class="w-4 h-4 text-slate-500" :class="{ 'animate-spin': userStore.loading }" />
        </button>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">

      <!-- ── Profile Card ──────────────────────────────────────────────────── -->
      <Skeleton v-if="userStore.loading && !userStore.user" class="h-32 w-full rounded-2xl" />

      <Card
        v-else
        class="bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-xl overflow-hidden relative"
      >
        <!-- Паттерн-фон -->
        <div class="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:24px_24px]" />
        <CardContent class="p-6 relative">
          <div class="flex items-center gap-5">
            <!-- Аватар -->
            <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shrink-0 overflow-hidden">
              <img v-if="userStore.user?.avatar_url" :src="userStore.user.avatar_url" class="w-full h-full object-cover" alt="avatar" />
              <User v-else class="w-10 h-10 text-white/80" />
            </div>
            <!-- Инфо -->
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold truncate">{{ userStore.user?.username || userStore.user?.email || 'Ученик' }}</h2>
              <!-- Текущий курс -->
              <div class="flex items-center gap-2 mt-2">
                <template v-if="currentCourse">
                  <span :class="['fi', 'fi-' + getFlagCode(currentCourse.target_lang?.code), 'text-base rounded-sm shadow-sm']" style="line-height:1"></span>
                  <span class="text-sm opacity-90 font-medium">{{ currentCourse.title }}</span>
                </template>
                <button
                  v-else
                  @click="router.push('/select-language')"
                  class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-colors"
                >
                  {{ t('select_language.choose') }} курс
                </button>
              </div>
            </div>
            <!-- Кнопка смены курса -->
            <button
              v-if="currentCourse"
              @click="router.push('/select-language')"
              class="shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Globe class="w-3.5 h-3.5" />
              Сменить
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- ── Stats Grid + Achievements (desktop 2 col) ────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Stats -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Статистика</h3>
          <div class="grid grid-cols-2 gap-3">
            <Skeleton v-if="userStore.loading && !userStore.user" v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
            <Card
              v-else
              v-for="stat in stats"
              :key="stat.label"
              :class="['border', stat.border, stat.bg, 'shadow-sm hover:shadow-md transition-shadow']"
            >
              <CardContent class="p-4 flex flex-col items-center justify-center text-center gap-1">
                <component :is="stat.icon" :class="['w-6 h-6 fill-current', stat.color]" />
                <div :class="['text-2xl font-black', stat.color]">{{ stat.value }}</div>
                <div class="text-xs text-slate-500 font-medium">{{ stat.label }}</div>
              </CardContent>
            </Card>
          </div>

          <!-- Прогресс курса -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 class="font-bold text-slate-700 flex items-center gap-2 mb-4">
              <TrendingUp class="w-4 h-4 text-slate-500" />
              {{ t('profile.current_course') }}
            </h4>
            <div v-if="currentCourse" class="space-y-3">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="font-medium text-slate-700">{{ currentCourse.title }}</span>
                <span class="text-slate-400">0%</span>
              </div>
              <Progress :model-value="0" class="h-2.5 rounded-full" />
              <p class="text-xs text-slate-400">Прогресс по курсу будет отображаться по мере выполнения уроков</p>
            </div>
            <div v-else class="flex flex-col items-center py-4 text-center gap-3">
              <Globe class="w-8 h-8 text-slate-300" />
              <p class="text-sm text-slate-500">Выберите курс, чтобы начать обучение</p>
              <button
                @click="router.push('/select-language')"
                class="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Выбрать курс →
              </button>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Достижения</h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="a in achievements"
              :key="a.id"
              :class="[
                'relative rounded-2xl border-2 flex flex-col items-center justify-center p-3 aspect-square transition-all',
                a.unlocked
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-40'
              ]"
            >
              <component :is="a.icon" :class="['w-7 h-7 mb-1', a.unlocked ? 'text-emerald-600 fill-current' : 'text-slate-400']" />
              <div class="text-[10px] font-semibold text-center text-slate-700 line-clamp-2 leading-tight">{{ a.title }}</div>
              <CheckCircle2 v-if="a.unlocked" class="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
