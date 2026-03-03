<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import api from '@/api/axios'
import { useUserStore } from '@/stores/user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Heart, HeartCrack, Trophy } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const lessonId = route.params.id as string

const lesson = ref<any>(null)
const isLoading = ref(true)
const currentExerciseIndex = ref(0)
const selectedOption = ref<string | null>(null)
const translationInput = ref('')
const isChecking = ref(false)
const isCorrect = ref<boolean | null>(null)
const isFinished = ref(false)
const isOutOfHearts = ref(false)
const mistakes = ref(0)
const earnedXp = ref(0)
const showNoHeartsDialog = ref(false)

const goToPracticeFromDialog = () => {
    showNoHeartsDialog.value = false
    try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
    router.push('/practice')
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        goBack()
        return
    }

    if (showNoHeartsDialog.value || isOutOfHearts.value || isFinished.value || !currentExercise.value) return

    if (e.key === 'Enter') {
        if (!isChecking.value && canCheck.value) {
            checkAnswer()
        } else if (isChecking.value) {
            nextExercise()
        }
        return
    }

    if (currentExercise.value.type === 'multiple_choice' && !isChecking.value) {
        if (e.ctrlKey || e.altKey || e.metaKey) return
        const key = parseInt(e.key)
        if (key >= 1 && key <= 4) {
            const options = currentExercise.value.payload.options
            if (key <= options.length) {
                selectedOption.value = options[key - 1]
            }
        }
    }
}

onMounted(async () => {
    window.addEventListener('keydown', handleKeydown)

    if (userStore.user && userStore.user.hearts <= 0) {
        showNoHeartsDialog.value = true
        isLoading.value = false
        try { WebApp.HapticFeedback.notificationOccurred('error') } catch { }
        return
    }

    isLoading.value = true
    try {
        const res = await api.get(`/v1/courses/lessons/${lessonId}`)
        lesson.value = res.data
        if (lesson.value.exercises) {
            lesson.value.exercises.sort((a: any, b: any) => a.order_index - b.order_index)
        }
    } catch (e) {
        console.error('Failed to load lesson', e)
        try { WebApp.showAlert('Ошибка при загрузке урока') } catch { }
    } finally {
        isLoading.value = false
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

const totalExercises = computed(() => lesson.value?.exercises?.length ?? 0)
const progressPercent = computed({
  get() {
    return totalExercises.value > 0 
      ? (currentExerciseIndex.value / totalExercises.value) * 100 
      : 0
  },
  set(newValue) {
    currentExerciseIndex.value = Math.round((newValue / 100) * totalExercises.value)
  }
})

const currentExercise = computed(() => {
    if (!lesson.value?.exercises?.length) return null
    return lesson.value.exercises[currentExerciseIndex.value]
})

const canCheck = computed(() => {
    if (!currentExercise.value) return false
    if (currentExercise.value.type === 'multiple_choice') return !!selectedOption.value
    if (currentExercise.value.type === 'translation') return !!translationInput.value.trim()
    return false
})

const checkAnswer = async () => {
    if (!currentExercise.value) return
    isChecking.value = true
    let correct = false

    if (currentExercise.value.type === 'multiple_choice') {
        correct = selectedOption.value === currentExercise.value.payload.correct
    } else if (currentExercise.value.type === 'translation') {
        correct = translationInput.value.trim().toLowerCase() === currentExercise.value.payload.translation.toLowerCase()
    }

    isCorrect.value = correct
    if (correct) {
        try { WebApp.HapticFeedback.notificationOccurred('success') } catch { }
    } else {
        mistakes.value++
        try { WebApp.HapticFeedback.notificationOccurred('error') } catch { }
        try {
            const res = await api.post('/v1/users/me/hearts/deduct')
            if (userStore.user) userStore.user.hearts = res.data.hearts
            if (res.data.hearts <= 0) isOutOfHearts.value = true
        } catch (e: any) {
            console.error('Failed to deduct heart', e)
            if (e.response && e.response.status === 400) {
                isOutOfHearts.value = true
                if (userStore.user) userStore.user.hearts = 0
            }
        }
    }
}

const heartsShake = ref(false)
watch(mistakes, () => {
    heartsShake.value = true
    setTimeout(() => heartsShake.value = false, 500)
})

const nextExercise = async () => {
    isChecking.value = false
    isCorrect.value = null
    selectedOption.value = null
    translationInput.value = ''
    if (currentExerciseIndex.value < totalExercises.value - 1) {
        currentExerciseIndex.value++
    } else {
        await finishLesson()
    }
}

const finishLesson = async () => {
    isFinished.value = true
    progressPercent.value = 100
    try {
        const res = await api.post(`/v1/courses/lessons/${lessonId}/complete`, null, {
            params: { mistakes: mistakes.value },
        })
        earnedXp.value = res.data.xp_earned
        if (userStore.user) {
            if (res.data.new_xp !== undefined) userStore.user.xp = res.data.new_xp
            if (res.data.new_hearts !== undefined) userStore.user.hearts = res.data.new_hearts
        }
        if (earnedXp.value > 0) {
            try { WebApp.HapticFeedback.notificationOccurred('success') } catch { }
        }
    } catch (e) {
        console.error('Failed to complete lesson', e)
    }
}

const goBack = () => router.go(-1)
</script>

<template>
    <div class="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
            <Button variant="ghost" size="icon" class="shrink-0 rounded-full text-slate-400" @click="goBack">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </Button>
            <Progress :model-value="progressPercent" class="flex-1 h-3" />
            <div class="flex items-center gap-1 text-sm font-bold text-red-500 shrink-0 transition-opacity"
                :class="{ 'opacity-50': heartsShake }">
                <Heart class="w-4 h-4 fill-current" />
                <span>{{ userStore.user?.hearts ?? 5 }}</span>
            </div>
        </header>

        <!-- Loading -->
        <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <Skeleton class="w-full max-w-md h-6" />
            <Skeleton class="w-full max-w-md h-40 rounded-2xl" />
            <div class="w-full max-w-md space-y-3 mt-4">
                <Skeleton class="h-14 rounded-xl" />
                <Skeleton class="h-14 rounded-xl" />
                <Skeleton class="h-14 rounded-xl" />
            </div>
        </div>

        <!-- No Exercises -->
        <div v-else-if="!currentExercise && !isFinished" class="flex-1 flex items-center justify-center p-6">
            <p class="text-slate-400 text-center">В этом уроке пока нет упражнений</p>
        </div>

        <!-- Out of Hearts Screen -->
        <div v-else-if="isOutOfHearts"
            class="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-50 relative">
            <div class="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center shadow-inner mb-6" v-motion
                :initial="{ scale: 0.8, opacity: 0 }" :enter="{ scale: 1, opacity: 1, transition: { duration: 200 } }">
                <HeartCrack class="w-14 h-14 text-red-400 fill-current" />
            </div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Закончились сердечки!</h2>
            <p class="text-slate-500 mb-8 max-w-xs">Подождите, пока они восстановятся, или пройдите практику.</p>
            <div class="flex flex-col gap-3 w-full max-w-xs">
                <Button class="w-full h-12 text-base font-bold rounded-xl"
                    @click="router.push('/practice')">Практика</Button>
                <Button variant="outline" class="w-full h-12 text-base font-bold rounded-xl" @click="goBack">На
                    главную</Button>
            </div>
        </div>

        <!-- Finished Screen -->
        <div v-else-if="isFinished" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div class="w-28 h-28 bg-amber-100 rounded-full flex items-center justify-center shadow-inner mb-6" v-motion
                :initial="{ scale: 0.8, opacity: 0 }"
                :enter="{ scale: 1, opacity: 1, transition: { duration: 200, delay: 100 } }">
                <Trophy class="w-14 h-14 text-amber-500 fill-current" />
            </div>
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Урок пройден!</h2>
            <div class="flex gap-3 w-full max-w-xs mb-8">
                <Card class="flex-1 border-amber-200 bg-amber-50">
                    <CardContent class="p-4 text-center">
                        <div class="text-[11px] font-bold text-amber-600/70 uppercase tracking-wide">Опыт</div>
                        <div class="text-xl font-bold text-amber-700 mt-1">+{{ earnedXp }} XP</div>
                    </CardContent>
                </Card>
                <Card class="flex-1 border-emerald-200 bg-emerald-50">
                    <CardContent class="p-4 text-center">
                        <div class="text-[11px] font-bold text-emerald-600/70 uppercase tracking-wide">Ошибки</div>
                        <div class="text-xl font-bold text-emerald-700 mt-1">{{ mistakes }}</div>
                    </CardContent>
                </Card>
            </div>
            <Button class="w-full max-w-xs h-12 text-base font-bold rounded-xl" @click="goBack">Продолжить</Button>
        </div>

        <!-- Exercise Area -->
        <div v-else-if="currentExercise" class="flex-1 flex flex-col min-h-0">
            <div class="flex-1 overflow-y-auto p-5 max-w-2xl mx-auto w-full">
                <h2 class="text-xl font-bold text-slate-800 mb-6 leading-snug">
                    {{ currentExercise.payload.question || 'Переведите это' }}
                </h2>

                <!-- Multiple Choice -->
                <div v-if="currentExercise.type === 'multiple_choice'" class="space-y-3">
                    <Card v-for="(option, idx) in currentExercise.payload.options" :key="idx"
                        class="cursor-pointer transition-all active:scale-[0.98]" :class="[
                            !isChecking && selectedOption === option
                                ? 'border-primary border-2 bg-primary/5 shadow-md'
                                : !isChecking ? 'border border-slate-200 hover:border-slate-300' : '',
                            isChecking && option === currentExercise.payload.correct
                                ? 'border-2 border-emerald-500 bg-emerald-50' : '',
                            isChecking && selectedOption === option && !isCorrect
                                ? 'border-2 border-red-400 bg-red-50' : '',
                        ]" @click="!isChecking && (selectedOption = option)">
                        <CardContent class="p-4 flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0"
                                :class="[
                                    !isChecking && selectedOption === option
                                        ? 'border-primary bg-primary text-white'
                                        : !isChecking ? 'border-slate-300 text-slate-400' : '',
                                    isChecking && option === currentExercise.payload.correct
                                        ? 'border-emerald-500 bg-emerald-500 text-white' : '',
                                    isChecking && selectedOption === option && !isCorrect
                                        ? 'border-red-400 bg-red-400 text-white' : '',
                                ]">
                                {{ idx + 1 }}
                            </div>
                            <span class="font-medium text-slate-700 text-[15px]">{{ option }}</span>
                        </CardContent>
                    </Card>
                </div>

                <!-- Translation -->
                <div v-else-if="currentExercise.type === 'translation'" class="space-y-5">
                    <Card class="border border-slate-200 bg-white">
                        <CardContent class="p-6 flex items-center justify-center">
                            <span class="text-3xl font-bold text-primary break-all text-center leading-relaxed">
                                {{ currentExercise.payload.text }}
                            </span>
                        </CardContent>
                    </Card>
                    <Input v-model="translationInput" class="h-14 text-base px-4 rounded-xl" :class="[
                        isChecking && isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : '',
                        isChecking && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : '',
                    ]" placeholder="Введите перевод..." :disabled="isChecking" />
                    <Card v-if="isChecking && !isCorrect" class="border-red-200 bg-red-50">
                        <CardContent class="p-4">
                            <p class="text-red-700 text-sm">
                                <span class="font-bold">Правильный ответ: </span>{{ currentExercise.payload.translation
                                }}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <!-- Bottom Action Bar -->
            <div class="bg-white border-t border-slate-200 p-4 shrink-0">
                <div class="max-w-2xl mx-auto">
                    <Button v-if="!isChecking" class="w-full h-12 text-base font-bold rounded-xl" :disabled="!canCheck"
                        @click="checkAnswer">
                        Проверить <span class="ml-2 opacity-50 font-normal"> (Enter)</span>
                    </Button>
                    <Button v-else class="w-full h-12 text-base font-bold rounded-xl"
                        :class="isCorrect ? 'bg-emerald-500 hover:bg-emerald-600 outline-none focus:ring-2 focus:ring-emerald-400' : 'bg-red-500 hover:bg-red-600 outline-none focus:ring-2 focus:ring-red-400'"
                        @click="nextExercise">
                        Продолжить <span class="ml-2 opacity-70 font-normal"> (Enter)</span>
                    </Button>
                </div>
            </div>
        </div>

        <!-- No Hearts Dialog (for direct navigation) -->
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
