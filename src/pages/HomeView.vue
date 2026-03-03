<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WebApp from '@twa-dev/sdk'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUserStore } from '@/stores/user'
import api from '@/api/axios'
import {
  Flame, Heart, Star, BookOpen,
  MessageCircle, Hash, Soup, Plane, HandMetal, Map, HeartCrack
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
  { color: 'from-emerald-400 to-emerald-500', gradient: 'bg-emerald-500' },
  { color: 'from-blue-400 to-blue-500', gradient: 'bg-blue-500' },
  { color: 'from-purple-400 to-purple-500', gradient: 'bg-purple-500' },
  { color: 'from-orange-400 to-orange-500', gradient: 'bg-orange-500' },
]

const unitIcons: Component[] = [HandMetal, MessageCircle, Hash, Soup, BookOpen, Plane, Map]

onMounted(async () => {
  try {
    isLoading.value = true

    // Ensure user profile is loaded
    if (!userStore.user) {
      await userStore.fetchProfile()
    }

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
          gradient: gradients[index % gradients.length]?.gradient,
        }))
        .sort((a: any, b: any) => a.order_index - b.order_index)
      currentCourse.value = courseData
    } else {
      // If no course selected, the router should have intercepted this,
      // but as a fallback redirect to selection
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

const hapticTap = () => {
  try { WebApp.HapticFeedback.impactOccurred('light') } catch { }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div class="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
        <div class="flex items-center gap-2 cursor-pointer" @click="hapticTap">
          <div class="w-8 h-8 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
            <BookOpen class="w-4 h-4 text-primary" />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1" @click="hapticTap">
            <Flame class="w-4 h-4 text-orange-500 fill-current" />
            <span class="font-bold text-orange-500 text-sm">{{ currentStreak }}</span>
          </div>
          <div class="flex items-center gap-1" @click="hapticTap">
            <Heart class="w-4 h-4 text-red-500 fill-current" />
            <span class="font-bold text-red-500 text-sm">{{ userStore.user?.hearts }}</span>
          </div>
          <div class="flex items-center gap-1" @click="hapticTap">
            <Star class="w-4 h-4 text-amber-500 fill-current" />
            <span class="font-bold text-amber-500 text-sm">{{ userStore.user?.xp }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="md:px-0 px-4 py-6 max-w-3xl mx-auto">
      <!-- Skeleton Loading -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4">
          <Skeleton class="w-16 h-16 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-5 w-2/3" />
            <Skeleton class="h-3 w-1/2" />
            <Skeleton class="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      <!-- Units List -->
      <div v-else-if="currentCourse" class="space-y-4">
        <div v-for="(unit, index) in currentCourse.units" :key="unit.id" v-motion :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200, delay: index * 50 } }">
          <Card
            class="overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] transition-transform"
            @click="openUnit(unit.id)">
            <CardContent class="p-0">
              <div class="flex items-center gap-4 p-4">
                <!-- Unit Icon Circle -->
                <div :class="[
                  'w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md border-[3px] border-white',
                  `bg-gradient-to-b ${unit.color}`
                ]">
                  <component :is="unitIcons[unit.order_index % unitIcons.length]" class="w-6 h-6 text-white" />
                </div>
                <!-- Unit Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-800 text-base truncate">{{ unit.title }}</h3>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">{{ unit.description }}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <Progress
                      :model-value="unit.total_lessons > 0 ? (unit.completed_lessons / unit.total_lessons) * 100 : 0"
                      class="h-2 flex-1" />
                    <span class="text-[11px] font-semibold text-slate-400 shrink-0">
                      {{ unit.completed_lessons }}/{{ unit.total_lessons }}
                    </span>
                  </div>
                </div>
                <!-- Arrow -->
                <svg class="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- No Hearts Dialog -->
    <Dialog v-model:open="showNoHeartsDialog">
      <DialogContent class="sm:max-w-md w-[calc(100%-2rem)] rounded-3xl p-6">
        <DialogHeader>
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner mx-auto mb-4">
            <HeartCrack class="w-8 h-8 text-red-500 fill-current" />
          </div>
          <DialogTitle class="text-center text-xl font-bold">
            Закончились сердечки!
          </DialogTitle>
          <DialogDescription class="text-center text-slate-500 pt-2 pb-4">
            Пройдите практику, чтобы восстановить сердечки и продолжить обучение.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-col sm:flex-col gap-3">
          <Button class="w-full text-base h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold"
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