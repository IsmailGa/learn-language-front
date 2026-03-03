<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import { Home, Gamepad2, User, Type } from 'lucide-vue-next'
import type { Component } from 'vue'

const route = useRoute()
const router = useRouter()

const tabs: { path: string; icon: Component; label: string }[] = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/alphabet', icon: Type, label: 'Алфавит' },
    { path: '/practice', icon: Gamepad2, label: 'Практика' },
    { path: '/profile', icon: User, label: 'Профиль' }
]

const isActive = (path: string) => route.path === path

const navigateTo = (path: string) => {
    if (route.path !== path) {
        WebApp.HapticFeedback.impactOccurred('light')
        router.push(path).then(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        WebApp.HapticFeedback.impactOccurred('light')
    }
}
</script>

<template>
    <nav
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-around px-2">
            <button v-for="tab in tabs" :key="tab.path" @click="navigateTo(tab.path)" :class="[
                'flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200',
                isActive(tab.path) ? 'text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            ]">
                <div :class="[
                    'mb-0.5 w-8 h-6 flex items-center justify-center rounded-lg transition-all duration-200',
                    isActive(tab.path) ? 'bg-primary/10 scale-105' : ''
                ]">
                    <component :is="tab.icon" class="w-5 h-5" />
                </div>
                <span
                    :class="['text-[10px] font-medium transition-all duration-200', isActive(tab.path) ? 'font-bold' : '']">
                    {{ tab.label }}
                </span>
                <div v-if="isActive(tab.path)" class="w-1 h-1 bg-primary rounded-full mt-0.5" />
            </button>
        </div>
    </nav>
</template>

<style scoped>
.pb-safe {
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 4px);
}
</style>
