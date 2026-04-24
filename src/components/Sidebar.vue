<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { Home, Gamepad2, User, BookOpen, Settings, Flame, Heart, Star } from 'lucide-vue-next'
import type { Component } from 'vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menus = computed<{ path: string; icon: Component; label: string }[]>(() => [
  { path: '/',          icon: Home,      label: t('nav.home') },
  { path: '/alphabet',  icon: BookOpen,  label: t('nav.alphabet') },
  { path: '/practice',  icon: Gamepad2,  label: t('nav.practice') },
  { path: '/profile',   icon: User,      label: t('nav.profile') },
  { path: '/settings',  icon: Settings,  label: t('nav.settings') },
])

const isActive = (path: string) => route.path === path || (path !== '/' && route.path.startsWith(path))
const navigateTo = (path: string) => { if (route.path !== path) router.push(path) }
</script>

<template>
  <!-- Desktop Sidebar — скрыт на мобилках -->
  <aside
    class="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-100 fixed left-0 top-0 z-50 shadow-sm"
  >
    <!-- Логотип -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
        <BookOpen class="w-5 h-5 text-white" />
      </div>
      <div>
        <p class="font-extrabold text-slate-800 text-base leading-tight">LinguaLearn</p>
        <p class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">AI Language App</p>
      </div>
    </div>

    <!-- Статистика пользователя -->
    <div v-if="userStore.user" class="mx-4 mt-4 mb-2 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center justify-around">
      <div class="flex flex-col items-center gap-0.5">
        <div class="flex items-center gap-1">
          <Flame class="w-4 h-4 text-orange-500 fill-current" />
          <span class="font-bold text-orange-500 text-sm">{{ userStore.user.streak }}</span>
        </div>
        <span class="text-[9px] text-slate-400 uppercase tracking-wide font-medium">{{ $t('home.streak') }}</span>
      </div>
      <div class="w-px h-8 bg-slate-200" />
      <div class="flex flex-col items-center gap-0.5">
        <div class="flex items-center gap-1">
          <Heart class="w-4 h-4 text-red-500 fill-current" />
          <span class="font-bold text-red-500 text-sm">{{ userStore.user.hearts }}</span>
        </div>
        <span class="text-[9px] text-slate-400 uppercase tracking-wide font-medium">{{ $t('home.hearts') }}</span>
      </div>
      <div class="w-px h-8 bg-slate-200" />
      <div class="flex flex-col items-center gap-0.5">
        <div class="flex items-center gap-1">
          <Star class="w-4 h-4 text-amber-500 fill-current" />
          <span class="font-bold text-amber-500 text-sm">{{ userStore.user.xp }}</span>
        </div>
        <span class="text-[9px] text-slate-400 uppercase tracking-wide font-medium">{{ $t('home.xp') }}</span>
      </div>
    </div>

    <!-- Навигационные пункты -->
    <nav class="flex flex-col gap-1 px-4 mt-2 flex-1">
      <button
        v-for="menu in menus"
        :key="menu.path"
        @click="navigateTo(menu.path)"
        :class="[
          'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left w-full',
          isActive(menu.path)
            ? 'bg-primary/10 text-primary'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        ]"
      >
        <!-- Иконка -->
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          isActive(menu.path)
            ? 'bg-primary/15 shadow-sm'
            : 'bg-slate-100 group-hover:bg-slate-200'
        ]">
          <component :is="menu.icon" class="w-4 h-4" />
        </div>
        <!-- Лейбл -->
        <span :class="['text-sm font-semibold transition-all', isActive(menu.path) ? 'text-primary' : '']">
          {{ menu.label }}
        </span>
        <!-- Активный индикатор -->
        <div v-if="isActive(menu.path)" class="ml-auto w-1.5 h-5 bg-primary rounded-full" />
      </button>
    </nav>

    <!-- Аватар пользователя снизу -->
    <div v-if="userStore.user" class="px-4 py-4 border-t border-slate-100">
      <div class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition" @click="navigateTo('/profile')">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {{ (userStore.user.username || userStore.user.email || '?')[0].toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-700 text-sm truncate">{{ userStore.user.username || userStore.user.email }}</p>
          <p class="text-[10px] text-slate-400 truncate">{{ userStore.user.xp }} XP</p>
        </div>
      </div>
    </div>
  </aside>
</template>
