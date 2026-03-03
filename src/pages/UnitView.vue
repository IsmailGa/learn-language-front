<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import api from '@/api/axios'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useUserStore } from '@/stores/user'
import { Star, HeartCrack } from 'lucide-vue-next'

WebApp.ready()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const unitId = route.params.id as string

const unitDetails = ref<{ title: string; description: string; lessons: any[] } | null>(null)
const isLoading = ref(true)

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        goBack()
        return
    }
}

onMounted(async () => {
    window.addEventListener('keydown', handleKeydown)

    try {
        isLoading.value = true
        const courseId = userStore.user?.current_course_id
        if (courseId) {
            const res = await api.get(`/v1/courses/${courseId}/units/${unitId}`)
            unitDetails.value = res.data
            if (unitDetails.value?.lessons) {
                unitDetails.value.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
            }
        } else {
            router.push('/select-language')
        }
    } catch (err) {
        console.error('Failure fetching unit:', err)
    } finally {
        isLoading.value = false
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

const showNoHeartsDialog = ref(false)

const goToPracticeFromDialog = () => {
    showNoHeartsDialog.value = false
    try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
    router.push('/practice')
}

const startLesson = (lessonId: string) => {
    if (userStore.user && userStore.user.hearts <= 0) {
        showNoHeartsDialog.value = true
        try { WebApp.HapticFeedback.notificationOccurred('error') } catch { }
        return
    }
    try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
    router.push(`/lesson/${lessonId}`)
}

const goBack = () => router.push('/')
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div class="flex items-center gap-3 px-4 h-14 max-w-3xl mx-auto">
                <Button variant="ghost" size="icon" class="shrink-0 rounded-full" @click="goBack">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Button>
                <h1 class="text-lg font-bold text-slate-800 truncate">{{ unitDetails?.title || 'Загрузка...' }}</h1>
            </div>
        </header>

        <div class="px-4 py-6 max-w-3xl mx-auto">
            <!-- Skeleton Loading -->
            <div v-if="isLoading" class="space-y-4">
                <Skeleton class="h-4 w-3/4 mb-6" />
                <div v-for="i in 3" :key="i">
                    <Card class="mb-3">
                        <CardContent class="p-4 flex items-center gap-4">
                            <Skeleton class="w-12 h-12 rounded-full shrink-0" />
                            <div class="flex-1 space-y-2">
                                <Skeleton class="h-4 w-1/2" />
                                <Skeleton class="h-3 w-2/3" />
                            </div>
                            <Skeleton class="h-4 w-12" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <!-- Unit Content -->
            <div v-else-if="unitDetails">
                <p class="text-slate-500 text-sm mb-6">{{ unitDetails.description }}</p>

                <!-- Lesson List -->
                <div class="space-y-3">
                    <div v-for="(lesson, index) in unitDetails.lessons" :key="lesson.id" v-motion
                        :initial="{ opacity: 0 }"
                        :enter="{ opacity: 1, transition: { duration: 200, delay: index * 50 } }">
                        <Card
                            class="overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] transition-all"
                            @click="startLesson(lesson.id)">
                            <CardContent class="p-4 flex items-center gap-4">
                                <div
                                    class="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                                    {{ index + 1 }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-slate-800 text-[15px] truncate">{{ lesson.title }}
                                    </h3>
                                    <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">{{ lesson.description }}</p>
                                </div>
                                <div class="flex items-center gap-1 text-amber-500 font-bold text-sm shrink-0">
                                    <Star class="w-3.5 h-3.5 fill-current" />
                                    <span>{{ lesson.xp_reward }}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div v-if="!unitDetails.lessons || unitDetails.lessons.length === 0"
                    class="text-center py-16 text-slate-400 text-sm">
                    В этом блоке пока нет уроков.
                </div>
            </div>
        </div>

        <!-- No Hearts Dialog -->
        <Dialog v-model:open="showNoHeartsDialog">
            <DialogContent class="sm:max-w-md w-[calc(100%-2rem)] rounded-3xl p-6">
                <DialogHeader>
                    <div
                        class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner mx-auto mb-4">
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
