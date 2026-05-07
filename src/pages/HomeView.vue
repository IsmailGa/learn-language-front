<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WebApp from '@twa-dev/sdk'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useUserStore } from '@/stores/user'
import api from '@/api/axios'
import {
  Flame, Heart, Star, BookOpen,
  MessageCircle, Hash, Soup, Plane, HandMetal, Map, HeartCrack, ChevronRight
} from 'lucide-vue-next'
import type { Component } from 'vue'

WebApp.ready()
WebApp.expand()

const router = useRouter()
const userStore = useUserStore()
const currentStreak = ref(userStore.user?.streak || 0)

interface Unit {
  id: string
  title: string
  description: string
  order_index: number
  is_active: boolean
  is_completed: boolean
  progress: number
  total_lessons: number
  completed_lessons: number
  color: string
  gradient: string
}

interface Course {
  id: string
  title: string
  units: Unit[]
}

const currentCourse = ref<Course | null>(null)
const isLoading = ref(true)

const gradients = [
  { color: '',  bg: 'hsl(var(--primary))' },
  { color: '',  bg: 'hsl(var(--success))' },
  { color: '',  bg: 'hsl(var(--accent))' },
  { color: '',  bg: 'hsl(var(--warning))' },
]

const unitIcons: Component[] = [HandMetal, MessageCircle, Hash, Soup, BookOpen, Plane, Map]

onMounted(async () => {
  try {
    isLoading.value = true
    if (!userStore.user) await userStore.fetchProfile()

    const courseId = userStore.user?.current_course_id
    if (courseId) {
      const courseResponse = await api.get(`/v1/courses/${courseId}`)
      const courseData = courseResponse.data
      courseData.units = courseData.units
        .map((u: any, index: number) => ({
          ...u,
          is_active: true,
          is_completed: false,
          progress: 0,
          total_lessons: u.lessons?.length ?? 0,
          completed_lessons: 0,
          color: gradients[index % gradients.length]?.color,
          gradient: gradients[index % gradients.length]?.bg,
        }))
        .sort((a: any, b: any) => a.order_index - b.order_index)
      currentCourse.value = courseData
    } else {
      router.push('/select-language')
    }
  } catch (error) {
    console.error('Failed to fetch course data:', error)
  } finally {
    isLoading.value = false
  }
})

const showNoHeartsDialog = ref(false)

const goToPracticeFromDialog = () => {
  showNoHeartsDialog.value = false
  try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
  router.push('/practice')
}

const openUnit = (unitId: string) => {
  if (userStore.user && userStore.user.hearts <= 0) {
    showNoHeartsDialog.value = true
    try { WebApp.HapticFeedback.notificationOccurred('error') } catch { }
    return
  }
  try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
  router.push(`/unit/${unitId}`)
}
</script>

<template>
  <div class="min-h-screen" style="background: hsl(var(--background))">

    <!-- ── Sticky Header ──────────────────────────────────────── -->
    <header class="sticky top-0 z-40 glass border-b border-border/60 shadow-sm">
      <div class="flex items-center justify-between px-4 h-14 container-fluid">
        <!-- Logo mark (mobile) -->
        <div class="flex items-center gap-2.5 lg:hidden">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center"
            style="background: hsl(var(--primary))">
            <span class="text-white font-black text-sm" style="letter-spacing: -0.04em">T</span>
          </div>
          <span class="font-black text-foreground" style="letter-spacing: -0.03em; font-size: 1.125rem">tilgo</span>
        </div>
        <!-- Desktop title -->
        <h1 class="hidden lg:block font-black text-foreground" style="font-size: clamp(1.25rem, 2vw, 1.5rem); letter-spacing: -0.02em">
          {{ currentCourse?.title || 'Мой курс' }}
        </h1>

        <!-- Stats chips -->
        <div class="flex items-center gap-2">
          <div class="stat-chip" style="background: hsl(39 100% 95%); color: hsl(39 80% 45%)">
            <Flame class="w-3.5 h-3.5 fill-current" />
            <span>{{ currentStreak }}</span>
          </div>
          <div class="stat-chip" style="background: hsl(var(--accent) / 0.12); color: hsl(var(--accent))">
            <Heart class="w-3.5 h-3.5 fill-current" />
            <span>{{ userStore.user?.hearts }}</span>
          </div>
          <div class="stat-chip" style="background: hsl(48 100% 94%); color: hsl(42 80% 42%)">
            <Star class="w-3.5 h-3.5 fill-current" />
            <span>{{ userStore.user?.xp }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Content ────────────────────────────────────────────── -->
    <div class="container-fluid py-6 bottom-nav-offset">

      <!-- Section header -->
      <div v-if="!isLoading && currentCourse" class="mb-6">
        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Текущий курс</p>
        <h2 class="font-black text-foreground" style="font-size: clamp(1.375rem, 3vw, 2.25rem); letter-spacing: -0.02em">
          {{ currentCourse.title }}
        </h2>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="cards-grid">
        <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden border border-border"
          style="background: hsl(var(--card))">
          <Skeleton class="h-1.5 w-full" />
          <div class="p-5 space-y-4">
            <div class="flex gap-4">
              <Skeleton class="w-12 h-12 rounded-2xl shrink-0" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton class="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      <!-- Units Grid -->
      <div v-else-if="currentCourse" class="cards-grid">
        <div
          v-for="(unit, index) in currentCourse.units"
          :key="unit.id"
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 240, delay: index * 55 } }"
        >
          <div
            class="unit-card group"
            @click="openUnit(unit.id)"
            role="button"
            tabindex="0"
            @keydown.enter="openUnit(unit.id)"
          >
            <!-- Top accent bar -->
            <div class="h-1.5 w-full rounded-t-2xl" :style="{ background: unit.gradient }" />

            <div class="p-5">
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                  :style="{ background: unit.gradient }">
                  <component :is="unitIcons[unit.order_index % unitIcons.length]" class="w-6 h-6 text-white" />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-foreground text-base leading-tight">{{ unit.title }}</h3>
                  <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">{{ unit.description }}</p>
                </div>

                <!-- Arrow -->
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                  bg-muted group-hover:bg-primary group-hover:shadow-primary">
                  <ChevronRight class="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
              </div>

              <!-- Progress -->
              <div class="mt-4 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-muted-foreground">
                    {{ unit.completed_lessons }} / {{ unit.total_lessons }} уроков
                  </span>
                  <span class="badge badge-primary">
                    {{ unit.total_lessons > 0 ? Math.round((unit.completed_lessons / unit.total_lessons) * 100) : 0 }}%
                  </span>
                </div>
                <div class="h-2 rounded-full" style="background: hsl(var(--muted))">
                  <div
                    class="h-full rounded-full progress-gradient transition-all"
                    :style="{ width: unit.total_lessons > 0 ? (unit.completed_lessons / unit.total_lessons) * 100 + '%' : '0%' }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Hearts Dialog -->
    <Dialog v-model:open="showNoHeartsDialog">
      <DialogContent class="sm:max-w-md w-[calc(100%-2rem)] rounded-3xl p-6">
        <DialogHeader>
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner mx-auto mb-4"
            style="background: hsl(var(--accent) / 0.12)">
            <HeartCrack class="w-8 h-8 fill-current" style="color: hsl(var(--accent))" />
          </div>
          <DialogTitle class="text-center text-xl font-black" style="letter-spacing: -0.02em">
            Закончились сердечки!
          </DialogTitle>
          <DialogDescription class="text-center text-muted-foreground pt-2 pb-4">
            Пройдите практику, чтобы восстановить сердечки и продолжить обучение.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-col sm:flex-col gap-3">
          <Button class="w-full text-base h-12 rounded-xl font-black shadow-primary"
            style="background: hsl(var(--primary))"
            @click="goToPracticeFromDialog">
            Пойти на практику
          </Button>
          <Button variant="outline" class="w-full text-base h-12 rounded-xl font-bold"
            @click="showNoHeartsDialog = false">
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>

<style scoped>
.unit-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border) / 0.7);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  outline: none;
}

.unit-card:active {
  transform: scale(0.98);
}

@media (hover: hover) {
  .unit-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }
}

.unit-card:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3);
}
</style>