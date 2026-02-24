<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import { Card, CardContent } from '@/components/ui/card'
import { useUserStore } from '@/stores/user'
import { RefreshCw, AlertTriangle, NotebookPen, Zap, Target, BookOpen, BarChart2, CheckCircle2, ClipboardList } from 'lucide-vue-next'
import type { Component } from 'vue'

WebApp.ready()
WebApp.expand()

const userStore = useUserStore()
const router = useRouter()

const practiceCategories = ref([
    { id: 1, title: 'Повторение', subtitle: 'Закрепи изученное', icon: RefreshCw as Component, color: 'from-blue-400 to-blue-500', count: 12 },
    { id: 2, title: 'Слабые места', subtitle: 'Ошибки прошлых уроков', icon: AlertTriangle as Component, color: 'from-red-400 to-red-500', count: 5 },
    { id: 3, title: 'Словарная практика', subtitle: 'Выучи новые слова', icon: NotebookPen as Component, color: 'from-purple-400 to-purple-500', count: 8 },
    { id: 4, title: 'Быстрая практика', subtitle: '5 минут на повторение', icon: Zap as Component, color: 'from-amber-400 to-amber-500', count: 0 },
])

const startPractice = (_categoryId: number) => {
    try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
    router.push('/practice/session')
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24 pt-6 md:px-0 px-4">
        <div class="space-y-6">
            <!-- Header -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200 } }"
                class="space-y-2">
                <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Zap class="w-6 h-6 text-primary" /> Практика
                </h1>
                <p class="text-slate-500">Закрепи свои знания и стань мастером!</p>
            </div>

            <!-- Today's Progress -->
            <Card v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200, delay: 50 } }"
                class="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white border-0 shadow-lg">
                <CardContent class="p-5">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h3 class="font-bold text-lg opacity-90">Сегодняшний прогресс</h3>
                            <p class="text-sm opacity-75">Продолжай в том же духе!</p>
                        </div>
                        <Target class="w-10 h-10 opacity-80" />
                    </div>
                    <div class="grid grid-cols-3 gap-3 mt-4">
                        <div class="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">{{ userStore.user?.xp || 0 }}</div>
                            <div class="text-xs opacity-75">XP</div>
                        </div>
                        <div class="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">15</div>
                            <div class="text-xs opacity-75">Упражнений</div>
                        </div>
                        <div class="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">95%</div>
                            <div class="text-xs opacity-75">Точность</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Practice Categories -->
            <div class="space-y-4">
                <h3 v-motion :initial="{ opacity: 0 }"
                    :enter="{ opacity: 1, transition: { duration: 200, delay: 100 } }"
                    class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen class="w-5 h-5 text-slate-600" /> Режимы практики
                </h3>
                <div class="space-y-3">
                    <div v-for="(category, index) in practiceCategories" :key="category.id" v-motion
                        :initial="{ opacity: 0 }"
                        :enter="{ opacity: 1, transition: { duration: 200, delay: 100 + index * 50 } }">
                        <Card
                            class="relative overflow-hidden transition-all duration-300 border-2 bg-white shadow-lg hover:shadow-xl cursor-pointer active:scale-[0.98] border-slate-200"
                            @click="startPractice(category.id)">
                            <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
                                :class="`bg-gradient-to-b ${category.color}`"></div>
                            <CardContent class="p-4 pl-5">
                                <div class="flex items-center gap-4">
                                    <div
                                        :class="['w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', `bg-gradient-to-br ${category.color} text-white`]">
                                        <component :is="category.icon" class="w-7 h-7" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-bold text-slate-800 truncate">{{ category.title }}</h4>
                                        <p class="text-sm text-slate-500">{{ category.subtitle }}</p>
                                        <div class="mt-2" v-if="category.count > 0">
                                            <span
                                                class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                                <ClipboardList class="w-3 h-3" /> {{ category.count }} упражнений
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200, delay: 200 } }"
                class="space-y-3">
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 class="w-5 h-5 text-slate-600" /> Последняя активность
                </h3>
                <Card class="border-2 border-slate-200">
                    <CardContent class="p-4">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 class="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div class="font-medium text-slate-800">Хангыль - Урок 4</div>
                                        <div class="text-sm text-slate-500">2 часа назад</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-emerald-600">+15 XP</div>
                                    <div class="text-xs text-slate-400">100%</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 class="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div class="font-medium text-slate-800">Повторение слов</div>
                                        <div class="text-sm text-slate-500">Вчера</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-blue-600">+10 XP</div>
                                    <div class="text-xs text-slate-400">95%</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
