<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { Home, Gamepad2, User, BookOpen, Settings, Flame, Heart, Star, Zap } from 'lucide-vue-next'
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
  <!-- Desktop Full Sidebar (lg+) -->
  <aside class="sidebar-full hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50"
    style="width: var(--sidebar-width)">

    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-border/60">
      <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style="background: hsl(var(--primary))">
        <span class="text-white font-black text-lg leading-none" style="letter-spacing: -0.05em">T</span>
      </div>
      <div>
        <p class="font-black text-foreground text-base leading-tight" style="letter-spacing: -0.03em">tilgo</p>
        <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">AI Language App</p>
      </div>
    </div>

    <!-- User Stats -->
    <div v-if="userStore.user" class="mx-4 mt-4 mb-2 rounded-2xl p-3.5 border border-border/60"
      style="background: hsl(var(--muted))">
      <div class="flex items-center justify-around">
        <div class="flex flex-col items-center gap-0.5">
          <div class="flex items-center gap-1">
            <Flame class="w-3.5 h-3.5 text-orange-500 fill-current" />
            <span class="font-black text-orange-500 text-sm tabular-nums">{{ userStore.user.streak }}</span>
          </div>
          <span class="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">{{ $t('home.streak') }}</span>
        </div>
        <div class="w-px h-8" style="background: hsl(var(--border))" />
        <div class="flex flex-col items-center gap-0.5">
          <div class="flex items-center gap-1">
            <Heart class="w-3.5 h-3.5 fill-current" style="color: hsl(var(--accent))" />
            <span class="font-black text-sm tabular-nums" style="color: hsl(var(--accent))">{{ userStore.user.hearts }}</span>
          </div>
          <span class="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">{{ $t('home.hearts') }}</span>
        </div>
        <div class="w-px h-8" style="background: hsl(var(--border))" />
        <div class="flex flex-col items-center gap-0.5">
          <div class="flex items-center gap-1">
            <Star class="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span class="font-black text-amber-500 text-sm tabular-nums">{{ userStore.user.xp }}</span>
          </div>
          <span class="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">{{ $t('home.xp') }}</span>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex flex-col gap-1 px-3 mt-2 flex-1">
      <button
        v-for="menu in menus"
        :key="menu.path"
        @click="navigateTo(menu.path)"
        :class="[
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left w-full',
          isActive(menu.path)
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        ]"
        :style="isActive(menu.path) ? 'background: hsl(var(--primary))' : ''"
      >
        <!-- Icon -->
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0',
          isActive(menu.path) ? 'bg-white/20' : 'bg-muted group-hover:bg-border'
        ]">
          <component :is="menu.icon" class="w-4 h-4" />
        </div>
        <!-- Label -->
        <span class="text-sm font-bold truncate">{{ menu.label }}</span>
        <!-- Active dot -->
        <div v-if="isActive(menu.path)" class="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
      </button>
    </nav>

    <!-- Daily XP Banner -->
    <div v-if="userStore.user" class="mx-3 mb-3 rounded-2xl p-3.5 relative overflow-hidden border border-border/60"
      style="background: hsl(var(--accent) / 0.06)">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style="background: hsl(var(--accent))">
          <Zap class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-black text-foreground leading-tight">Ежедневная цель</p>
          <p class="text-[10px] text-muted-foreground font-semibold">{{ userStore.user.xp }} / 100 XP</p>
        </div>
      </div>
      <div class="mt-2.5 h-1.5 rounded-full" style="background: hsl(var(--border))">
        <div class="h-full rounded-full progress-gradient transition-all"
          :style="{ width: Math.min(userStore.user.xp, 100) + '%' }" />
      </div>
    </div>

    <!-- User Avatar -->
    <div v-if="userStore.user" class="px-3 py-3 border-t border-border/60">
      <button
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
        @click="navigateTo('/profile')"
      >
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
          style="background: hsl(var(--primary))">
          {{ (userStore.user.username || userStore.user.email || '?')[0].toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0 text-left">
          <p class="font-bold text-foreground text-sm truncate">{{ userStore.user.username || userStore.user.email }}</p>
          <p class="text-[10px] text-muted-foreground font-semibold">{{ userStore.user.xp }} XP</p>
        </div>
      </button>
    </div>
  </aside>

  <!-- Tablet Compact Sidebar (md only) -->
  <aside class="sidebar-compact hidden md:flex lg:hidden flex-col items-center py-4 fixed left-0 top-0 h-screen z-50 border-r border-border/60"
    style="width: var(--sidebar-compact-width); background: hsl(var(--card))">

    <!-- Logo mark -->
    <div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-6 shrink-0"
      style="background: hsl(var(--primary))">
      <span class="text-white font-black text-base leading-none" style="letter-spacing: -0.04em">T</span>
    </div>

    <!-- Nav icons -->
    <nav class="flex flex-col gap-2 flex-1">
      <button
        v-for="menu in menus"
        :key="menu.path"
        @click="navigateTo(menu.path)"
        :title="menu.label"
        :class="[
          'group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
          isActive(menu.path)
            ? 'text-primary-foreground shadow-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        ]"
        :style="isActive(menu.path) ? 'background: hsl(var(--primary))' : ''"
      >
        <component :is="menu.icon" class="w-5 h-5" />
        <!-- Tooltip -->
        <span class="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50
          text-foreground shadow-md border border-border"
          style="background: hsl(var(--card))">
          {{ menu.label }}
        </span>
      </button>
    </nav>

    <!-- Avatar -->
    <div v-if="userStore.user" class="mt-auto">
      <button
        @click="navigateTo('/profile')"
        title="Профиль"
        class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
        style="background: hsl(var(--primary))"
      >
        {{ (userStore.user.username || userStore.user.email || '?')[0].toUpperCase() }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-full {
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border) / 0.6);
}
</style>
