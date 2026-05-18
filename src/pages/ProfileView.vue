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
  {
    label: 'Всего XP', value: totalXp.value, icon: Star as Component,
    bg: 'hsl(42 100% 95%)', color: 'hsl(38 80% 42%)',
    iconBg: 'hsl(42 100% 70%)'
  },
  {
    label: 'Серия', value: currentStreak.value, icon: Flame as Component,
    bg: 'hsl(22 100% 95%)', color: 'hsl(22 80% 48%)',
    iconBg: 'hsl(22 100% 65%)'
  },
  {
    label: 'Лучшая серия', value: bestStreak.value, icon: Trophy as Component,
    bg: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))',
    iconBg: 'hsl(var(--success))'
  },
  {
    label: 'Жизни', value: hearts.value, icon: Heart as Component,
    bg: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))',
    iconBg: 'hsl(var(--accent))'
  },
])

const achievements: { id: number; title: string; icon: Component; unlocked: boolean; desc: string; color: string }[] = [
  { id: 1, title: 'Первые шаги',    icon: Target   as Component, unlocked: true,  desc: 'Завершил первый урок',  color: 'hsl(var(--primary))' },
  { id: 2, title: 'Неделя силы',    icon: Flame    as Component, unlocked: true,  desc: '7 дней подряд',        color: 'hsl(22 90% 55%)' },
  { id: 3, title: 'Знаток хангыля', icon: BookOpen as Component, unlocked: true,  desc: 'Выучил алфавит',       color: 'hsl(var(--success))' },
  { id: 4, title: 'Полиглот',       icon: Globe    as Component, unlocked: false, desc: 'Достигни 1000 XP',     color: 'hsl(var(--muted-foreground))' },
  { id: 5, title: 'Месяц успеха',   icon: Star     as Component, unlocked: false, desc: '30 дней подряд',       color: 'hsl(var(--muted-foreground))' },
  { id: 6, title: 'Мастер',         icon: Crown    as Component, unlocked: false, desc: 'Завершил все уроки',   color: 'hsl(var(--muted-foreground))' },
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
  <div class="min-h-screen" style="background: hsl(var(--background))">

    <!-- Header -->
    <header class="sticky top-0 z-40 glass border-b border-border/60 shadow-sm">
      <div class="flex items-center justify-between px-4 h-14 container-fluid">
        <h1 class="font-black text-foreground" style="font-size: clamp(1.25rem, 2.5vw, 1.75rem); letter-spacing: -0.02em">
          {{ t('profile.title') }}
        </h1>
        <button
          @click="refreshProfile"
          class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style="background: hsl(var(--muted))"
        >
          <RefreshCw class="w-4 h-4 text-muted-foreground" :class="{ 'animate-spin': userStore.loading }" />
        </button>
      </div>
    </header>

    <div class="container-fluid py-6 bottom-nav-offset max-w-5xl space-y-6">

      <!-- Profile Hero Card -->
      <Skeleton v-if="userStore.loading && !userStore.user" class="h-36 w-full rounded-2xl" />

      <div v-else class="profile-hero rounded-2xl p-6 relative overflow-hidden text-white">
        <!-- Dot pattern -->
        <div class="absolute inset-0 opacity-[0.07]"
          style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 22px 22px;" />
        <!-- No glow orb, removed -->

        <div class="relative flex items-center gap-5">
          <!-- Avatar -->
          <div class="w-20 h-20 rounded-2xl border-2 border-white/25 flex items-center justify-center shrink-0 overflow-hidden"
            style="background: rgba(255,255,255,0.15); backdrop-filter: blur(8px)">
            <img v-if="userStore.user?.avatar_url" :src="userStore.user.avatar_url"
              class="w-full h-full object-cover" alt="avatar" />
            <User v-else class="w-10 h-10 opacity-80" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h2 class="font-black text-2xl leading-tight truncate" style="letter-spacing: -0.02em">
              {{ userStore.user?.username || userStore.user?.email || 'Ученик' }}
            </h2>
            <div class="flex items-center gap-2 mt-2">
              <template v-if="currentCourse">
                <span :class="['fi', 'fi-' + getFlagCode(currentCourse.target_lang?.code), 'text-base rounded-sm shadow-sm']"
                  style="line-height:1" />
                <span class="text-sm opacity-85 font-semibold">{{ currentCourse.title }}</span>
              </template>
              <button v-else @click="router.push('/select-language')"
                class="px-3 py-1 rounded-full text-sm font-bold transition-colors"
                style="background: rgba(255,255,255,0.18)">
                Выбрать курс
              </button>
            </div>
          </div>

          <!-- Change course -->
          <button v-if="currentCourse" @click="router.push('/select-language')"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            style="background: rgba(255,255,255,0.18)">
            <Globe class="w-3.5 h-3.5" /> Сменить
          </button>
        </div>
      </div>

      <!-- Stats + Achievements grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Stats -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-muted-foreground uppercase tracking-widest">Статистика</h3>

          <div class="grid grid-cols-2 gap-3">
            <Skeleton v-if="userStore.loading && !userStore.user" v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
            <div v-else v-for="stat in stats" :key="stat.label"
              class="stat-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 border border-border/50"
              :style="{ background: stat.bg }">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-1 shadow-sm"
                :style="{ background: stat.iconBg }">
                <component :is="stat.icon" class="w-4.5 h-4.5 text-white fill-current" />
              </div>
              <div class="text-2xl font-black tabular-nums" :style="{ color: stat.color }">{{ stat.value }}</div>
              <div class="text-[11px] text-muted-foreground font-bold">{{ stat.label }}</div>
            </div>
          </div>

          <!-- Course progress -->
          <div class="rounded-2xl border border-border/60 p-5" style="background: hsl(var(--card))">
            <h4 class="font-black text-foreground flex items-center gap-2 mb-4"
              style="font-size: 0.9375rem">
              <TrendingUp class="w-4 h-4" style="color: hsl(var(--primary))" />
              {{ t('profile.current_course') }}
            </h4>
            <div v-if="currentCourse" class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="font-bold text-foreground">{{ currentCourse.title }}</span>
                <span class="badge badge-primary">0%</span>
              </div>
              <div class="h-2 rounded-full" style="background: hsl(var(--muted))">
                <div class="h-full rounded-full progress-gradient" style="width: 0%" />
              </div>
              <p class="text-xs text-muted-foreground font-medium">
                Прогресс отображается по мере выполнения уроков
              </p>
            </div>
            <div v-else class="flex flex-col items-center py-4 text-center gap-3">
              <Globe class="w-8 h-8 text-muted-foreground opacity-40" />
              <p class="text-sm text-muted-foreground font-medium">Выберите курс, чтобы начать обучение</p>
              <button @click="router.push('/select-language')"
                class="text-sm font-black transition-colors" style="color: hsl(var(--primary))">
                Выбрать курс →
              </button>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-muted-foreground uppercase tracking-widest">Достижения</h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="a in achievements"
              :key="a.id"
              :class="['achievement-card rounded-2xl border-2 flex flex-col items-center justify-center p-3 aspect-square relative transition-all', a.unlocked ? 'unlocked' : 'locked']"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 shadow-sm"
                :style="{ background: a.unlocked ? a.color : 'hsl(var(--muted))' }">
                <component :is="a.icon" class="w-4.5 h-4.5 text-white fill-current" />
              </div>
              <div class="text-[10px] font-black text-center leading-tight"
                :style="{ color: a.unlocked ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }">
                {{ a.title }}
              </div>
              <CheckCircle2 v-if="a.unlocked"
                class="absolute top-1.5 right-1.5 w-3.5 h-3.5"
                style="color: hsl(var(--success))" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-hero {
  background: hsl(var(--primary));
  box-shadow: 0 8px 24px hsl(var(--primary) / 0.25);
}

.stat-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

@media (hover: hover) {
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.achievement-card {
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.achievement-card.unlocked {
  background: hsl(var(--card));
  border-color: hsl(var(--border) / 0.7);
}

.achievement-card.locked {
  background: hsl(var(--muted));
  border-color: hsl(var(--border) / 0.5);
  opacity: 0.45;
}

@media (hover: hover) {
  .achievement-card.unlocked:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    opacity: 1;
  }
}
</style>
