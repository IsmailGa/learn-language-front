<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Home, Gamepad2, User } from 'lucide-vue-next'
import type { Component } from 'vue'

const route = useRoute()
const router = useRouter()

const menus: { path: string; icon: Component; label: string }[] = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/practice', icon: Gamepad2, label: 'Практика' },
    { path: '/profile', icon: User, label: 'Профиль' }
]

const isActive = (path: string) => route.path === path
const navigateTo = (path: string) => { if (route.path !== path) router.push(path) }
</script>

<template>
    <aside class="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 z-50 p-4">
        <div class="mb-8 px-4 py-2">
            <h1 class="text-2xl font-bold text-primary">LanguageLearn</h1>
        </div>
        <div class="flex flex-col gap-2">
            <button v-for="menu in menus" :key="menu.path" @click="navigateTo(menu.path)" :class="[
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                isActive(menu.path)
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-2 border-transparent'
            ]">
                <component :is="menu.icon" class="w-5 h-5 shrink-0" />
                <span class="font-bold tracking-wide uppercase text-sm">{{ menu.label }}</span>
            </button>
        </div>
    </aside>
</template>
