<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import WebApp from '@twa-dev/sdk'
import api from '@/api/axios'
import Sidebar from '@/components/Sidebar.vue'
import { Skeleton } from '@/components/ui/skeleton'

import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isLoading = ref(true)
const characters = ref<any[]>([])

onMounted(async () => {
    isLoading.value = true
    try {
        const courseId = userStore.user?.current_course_id
        if (courseId) {
            const charRes = await api.get(`/v1/courses/${courseId}/characters`)
            characters.value = charRes.data
        } else {
            // Fallback: try to get first course if somehow not selected
            const coursesRes = await api.get('/v1/courses')
            if (coursesRes.data && coursesRes.data.length > 0) {
                const firstCourseId = coursesRes.data[0].id
                const charRes = await api.get(`/v1/courses/${firstCourseId}/characters`)
                characters.value = charRes.data
            }
        }
    } catch (e) {
        console.error('Failed to load characters', e)
        try { WebApp.showAlert('Ошибка при загрузке алфавита') } catch { }
    } finally {
        isLoading.value = false
    }
})

const vowels = computed(() => characters.value.filter(c => c.type === 'vowel'))
const consonants = computed(() => characters.value.filter(c => c.type === 'consonant'))

const playSound = (_char: any) => {
    try { WebApp.HapticFeedback.impactOccurred('light') } catch { }
    // В будущем здесь можно добавить воспроизведение аудио
    // if (_char.audio_url) {
    //     new Audio(_char.audio_url).play()
    // }
}
</script>

<template>
    <div class="flex h-[100dvh] bg-slate-50 overflow-hidden">
        <Sidebar active-item="alphabet" />

        <main
            class="flex-1 flex flex-col min-w-0 border-l border-slate-200 bg-slate-50 relative pb-[calc(env(safe-area-inset-bottom)+70px)] md:pb-0 h-full">
            <header
                class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 p-5 shrink-0 flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-black text-slate-800 tracking-tight">Алфавит</h1>
                    <p class="text-slate-500 font-medium text-sm mt-0.5">Изучайте символы и их чтение</p>
                </div>
            </header>

            <div class="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-5 pb-8">
                <!-- Loading State -->
                <div v-if="isLoading" class="space-y-8">
                    <div v-for="i in 2" :key="i" class="space-y-4">
                        <Skeleton class="h-8 w-40" />
                        <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                            <Skeleton v-for="j in 10" :key="j" class="aspect-square rounded-2xl" />
                        </div>
                    </div>
                </div>

                <div v-else-if="characters.length > 0" class="space-y-10">
                    <!-- Гласные -->
                    <section v-if="vowels.length > 0">
                        <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Гласные
                            <span class="px-2 py-0.5 bg-sky-100 text-sky-600 rounded-full text-xs font-bold">{{
                                vowels.length }}</span>
                        </h2>
                        <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                            <button v-for="char in vowels" :key="char.id" @click="playSound(char)"
                                class="aspect-square flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-2xl hover:border-sky-400 hover:bg-sky-50 transition-all active:scale-95 shadow-sm group">
                                <span
                                    class="text-3xl sm:text-4xl font-black text-slate-800 group-hover:text-sky-600 transition-colors mb-1">{{
                                        char.character }}</span>
                                <span
                                    class="text-xs sm:text-sm font-bold text-slate-400 group-hover:text-sky-500 transition-colors uppercase tracking-wider">{{
                                        char.transliteration }}</span>
                            </button>
                        </div>
                    </section>

                    <!-- Согласные -->
                    <section v-if="consonants.length > 0">
                        <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Согласные
                            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">{{
                                consonants.length }}</span>
                        </h2>
                        <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                            <button v-for="char in consonants" :key="char.id" @click="playSound(char)"
                                class="aspect-square flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm group">
                                <span
                                    class="text-3xl sm:text-4xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors mb-1">{{
                                        char.character }}</span>
                                <span
                                    class="text-xs sm:text-sm font-bold text-slate-400 group-hover:text-emerald-500 transition-colors uppercase tracking-wider">{{
                                        char.transliteration }}</span>
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
                    <p class="text-slate-500 max-w-xs">Символы для этого курса пока не добавлены.</p>
                </div>
            </div>
        </main>
    </div>
</template>
