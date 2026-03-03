<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api/axios'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

import { Globe, ArrowRight, CheckCircle2, Languages, ChevronLeft } from 'lucide-vue-next'
import WebApp from '@twa-dev/sdk'

const router = useRouter()
const userStore = useUserStore()

const languages = ref<any[]>([])
const courses = ref<any[]>([])
const isLoading = ref(true)
const selectingCourseId = ref<string | null>(null)

const step = ref<'source' | 'target'>('source')
const selectedSourceLangId = ref<string | null>(null)

onMounted(async () => {
    try {
        isLoading.value = true
        // Fetch languages for the first step
        const langRes = await api.get('/v1/courses/languages')
        languages.value = langRes.data

        // If user already has a course, maybe pre-select their source language?
        // For now, let's keep it clean

    } catch (error) {
        console.error('Failed to fetch data:', error)
    } finally {
        isLoading.value = false
    }
})

const selectSourceLang = async (langId: string) => {
    selectedSourceLangId.value = langId
    step.value = 'target'
    isLoading.value = true
    try {
        const courseRes = await api.get('/v1/courses', {
            params: { source_lang_id: langId }
        })
        courses.value = courseRes.data
    } catch (error) {
        console.error('Failed to fetch courses:', error)
    } finally {
        isLoading.value = false
    }
    try { WebApp.HapticFeedback.impactOccurred('light') } catch { }
}

const selectCourse = async (courseId: string) => {
    try {
        selectingCourseId.value = courseId
        try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
        await userStore.selectCourse(courseId)
        router.push('/')
    } catch (error) {
        console.error('Failed to select course:', error)
    } finally {
        selectingCourseId.value = null
    }
}

const goBack = () => {
    if (step.value === 'target') {
        step.value = 'source'
        selectedSourceLangId.value = null
    } else {
        router.push('/profile')
    }
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 p-6 flex flex-col">
        <div class="max-w-md mx-auto w-full flex-1 flex flex-col">
            <header class="mb-8 relative pt-4">
                <Button v-if="step === 'target' || userStore.user?.current_course_id" variant="ghost" size="icon"
                    class="absolute left-0 top-4 rounded-full" @click="goBack">
                    <ChevronLeft class="w-6 h-6" />
                </Button>

                <div class="text-center pt-8">
                    <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Languages v-if="step === 'source'" class="w-8 h-8 text-primary" />
                        <Globe v-else class="w-8 h-8 text-primary" />
                    </div>
                    <h1 class="text-2xl font-bold text-slate-900">
                        {{ step === 'source' ? 'Ваш родной язык' : 'Что будем учить?' }}
                    </h1>
                    <p class="text-slate-500 mt-2">
                        {{ step === 'source' ? 'Выберите язык, на котором вам удобнее учиться' : 'Выберите курс для изучения' }}
                    </p>
                </div>
            </header>

            <div class="space-y-4 flex-1">
                <div v-if="isLoading" class="space-y-4">
                    <Skeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-2xl" />
                </div>

                <!-- Step 1: Source Language -->
                <div v-else-if="step === 'source'" class="grid gap-3">
                    <Card v-for="lang in languages" :key="lang.id"
                        class="cursor-pointer border-2 border-white hover:border-primary/20 active:scale-[0.98] transition-all"
                        @click="selectSourceLang(lang.id)">
                        <CardContent class="p-4 flex items-center gap-4">
                            <span class="text-3xl">{{ lang.flag_emoji || '🌐' }}</span>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900">{{ lang.native_name }}</h3>
                                <p class="text-xs text-slate-500">{{ lang.name }}</p>
                            </div>
                            <ArrowRight class="w-5 h-5 text-slate-300" />
                        </CardContent>
                    </Card>
                </div>

                <!-- Step 2: Target Course -->
                <div v-else-if="step === 'target'" class="grid gap-4">
                    <div v-if="courses.length === 0" class="text-center py-12">
                        <p class="text-slate-500">Для этого языка пока нет доступных курсов.</p>
                        <Button variant="link" @click="step = 'source'" class="mt-2">Выбрать другой язык</Button>
                    </div>

                    <Card v-for="course in courses" :key="course.id" :class="[
                        'group cursor-pointer border-2 transition-all duration-200 hover:shadow-md active:scale-[0.98]',
                        userStore.user?.current_course_id === course.id
                            ? 'border-primary bg-primary/5'
                            : 'border-white hover:border-primary/20 bg-white'
                    ]" @click="selectCourse(course.id)">
                        <CardContent class="p-5 flex items-center gap-4">
                            <div
                                class="text-4xl w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                {{ course.target_lang?.flag_emoji || '🌐' }}
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900 text-lg">{{ course.title }}</h3>
                                <p class="text-slate-500 text-sm">
                                    {{ course.description || `Изучайте ${course.target_lang?.native_name || ''}` }}
                                </p>
                            </div>
                            <div v-if="selectingCourseId === course.id"
                                class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin">
                            </div>
                            <CheckCircle2 v-else-if="userStore.user?.current_course_id === course.id"
                                class="w-6 h-6 text-primary fill-primary/10" />
                            <ArrowRight v-else
                                class="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <footer class="mt-8 text-center text-xs text-slate-400 pb-4">
                Вы всегда сможете сменить язык в настройках профиля
            </footer>
        </div>
    </div>
</template>
