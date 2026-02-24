<script setup lang="ts">
import { ref, computed } from 'vue'
import WebApp from '@twa-dev/sdk'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Skeleton from '@/components/ui/skeleton.vue'
import { useUserStore } from '@/stores/user'
import {
    Star, Flame, Trophy, Heart, Globe, Crown,
    Target, BookOpen, TrendingUp, Settings, LogOut,
    User, CheckCircle2, RefreshCw
} from 'lucide-vue-next'
import type { Component } from 'vue'

WebApp.ready()
WebApp.expand()

const router = useRouter()
const userStore = useUserStore()

const currentStreak = computed(() => userStore.user?.streak || 0)
const totalXp = computed(() => userStore.user?.xp || 0)
const hearts = computed(() => userStore.user?.hearts ?? 5)
const bestStreak = computed(() => Math.max(currentStreak.value, 15))

const achievements = ref([
    { id: 1, title: 'Первые шаги', icon: Target as Component, unlocked: true, description: 'Завершил первый урок' },
    { id: 2, title: 'Неделя силы', icon: Flame as Component, unlocked: true, description: '7 дней подряд', fill: true },
    { id: 3, title: 'Знаток хангыля', icon: BookOpen as Component, unlocked: true, description: 'Выучил алфавит' },
    { id: 4, title: 'Полиглот', icon: Globe as Component, unlocked: false, description: 'Достигни 1000 XP' },
    { id: 5, title: 'Месяц успеха', icon: Star as Component, unlocked: false, description: '30 дней подряд', fill: true },
    { id: 6, title: 'Мастер', icon: Crown as Component, unlocked: false, description: 'Завершил все уроки', fill: true },
])

const stats = computed(() => [
    { label: 'Всего XP', value: totalXp.value, icon: Star as Component, color: 'text-amber-600', fill: true },
    { label: 'Текущий streak', value: currentStreak.value, icon: Flame as Component, color: 'text-orange-600', fill: true },
    { label: 'Лучший streak', value: bestStreak.value, icon: Trophy as Component, color: 'text-emerald-600', fill: true },
    { label: 'Сердечки', value: hearts.value, icon: Heart as Component, color: 'text-red-500', fill: true },
])

const hapticTap = () => { WebApp.HapticFeedback.impactOccurred('light') }
const goToSettings = () => { WebApp.HapticFeedback.impactOccurred('medium'); router.push('/settings') }
const logout = async () => { WebApp.HapticFeedback.impactOccurred('medium'); await userStore.logout(); router.push('/login') }
const refreshProfile = async () => { WebApp.HapticFeedback.impactOccurred('medium'); await userStore.fetchProfile(true) }
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
        <div class="px-4 py-6 space-y-6">
            <!-- Profile Header -->
            <Card v-if="userStore.loading && !userStore.user"
                class="border-0 shadow-xl overflow-hidden relative h-[140px]">
                <Skeleton class="h-full w-full" />
            </Card>

            <Card v-else v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200 } }"
                class="bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-xl overflow-hidden relative">
                <div
                    class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50">
                </div>
                <CardContent class="p-6 relative">
                    <div class="flex items-center gap-4">
                        <!-- Avatar -->
                        <div
                            class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden relative">
                            <img v-if="userStore.user?.avatar_url" :src="userStore.user.avatar_url" alt="User Avatar"
                                class="w-full h-full object-cover" />
                            <User v-else class="w-10 h-10 text-white/80" />
                        </div>
                        <!-- User Info -->
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold">{{ userStore.user?.username || 'Ученик' }}</h2>
                            <p class="text-sm opacity-75">Изучает корейский</p>
                            <div class="flex items-center gap-2 mt-2">
                                <div class="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                                    Уровень: Новичок
                                </div>
                            </div>
                        </div>
                        <!-- Refresh Button -->
                        <button @click.stop="refreshProfile"
                            class="absolute top-2 right-2 p-2 text-white/50 hover:text-white transition-colors">
                            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': userStore.loading }" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            <!-- Stats Grid -->
            <div v-if="userStore.loading && !userStore.user" class="grid grid-cols-2 gap-3">
                <Skeleton class="h-24 w-full rounded-xl" v-for="i in 4" :key="i" />
            </div>

            <div v-else v-motion :initial="{ opacity: 0 }"
                :enter="{ opacity: 1, transition: { duration: 200, delay: 50 } }" class="grid grid-cols-2 gap-3">
                <Card v-for="stat in stats" :key="stat.label"
                    class="border-2 border-slate-200 cursor-pointer hover:shadow-lg transition-transform active:scale-95"
                    @click="hapticTap">
                    <CardContent class="p-4 text-center">
                        <div class="flex justify-center mb-2">
                            <component :is="stat.icon"
                                :class="['w-7 h-7', stat.color, stat.fill ? 'fill-current' : '']" />
                        </div>
                        <div :class="['text-2xl font-bold mb-1', stat.color]">{{ stat.value }}</div>
                        <div class="text-xs text-slate-500">{{ stat.label }}</div>
                    </CardContent>
                </Card>
            </div>

            <!-- Progress Section -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200, delay: 50 } }"
                class="space-y-3">
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp class="w-5 h-5 text-slate-600" /> Прогресс обучения
                </h3>
                <Card class="border-2 border-slate-200">
                    <CardContent class="p-4 space-y-4">
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-slate-700">Хангыль</span>
                                <span class="text-slate-500">85%</span>
                            </div>
                            <Progress :model-value="85" class="h-2" />
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-slate-700">Приветствия</span>
                                <span class="text-slate-500">40%</span>
                            </div>
                            <Progress :model-value="40" class="h-2" />
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-slate-700">Общий прогресс</span>
                                <span class="text-slate-500">25%</span>
                            </div>
                            <Progress :model-value="25" class="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Achievements -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200, delay: 100 } }"
                class="space-y-3">
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Trophy class="w-5 h-5 text-slate-600 fill-current" /> Достижения
                </h3>
                <div class="grid grid-cols-3 gap-3">
                    <div v-for="achievement in achievements" :key="achievement.id" @click="hapticTap" :class="[
                        'relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-3 cursor-pointer transition-all',
                        achievement.unlocked
                            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg'
                            : 'bg-slate-50 border-slate-200 opacity-40'
                    ]">
                        <component :is="achievement.icon" class="w-8 h-8 mb-1"
                            :class="[achievement.unlocked ? 'text-emerald-600' : 'text-slate-400', achievement.fill ? 'fill-current' : '']" />
                        <div class="text-xs font-medium text-center text-slate-700 line-clamp-2">{{ achievement.title }}
                        </div>
                        <div v-if="achievement.unlocked" class="absolute top-1 right-1">
                            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 200, delay: 150 } }"
                class="space-y-3">
                <Button variant="outline"
                    class="w-full h-12 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2"
                    @click="goToSettings">
                    <Settings class="w-4 h-4" /> Настройки
                </Button>
                <Button variant="outline"
                    class="w-full h-12 rounded-xl border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 flex items-center gap-2"
                    @click="logout">
                    <LogOut class="w-4 h-4" /> Выйти
                </Button>
            </div>
        </div>
    </div>
</template>
