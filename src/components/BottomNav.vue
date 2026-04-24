<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import WebApp from '@twa-dev/sdk'
import { Home, Gamepad2, User, BookOpen, Settings } from 'lucide-vue-next'
import type { Component } from 'vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tabs = computed<{ path: string; icon: Component; label: string }[]>(() => [
  { path: '/',         icon: Home,      label: t('nav.home') },
  { path: '/alphabet', icon: BookOpen,  label: t('nav.alphabet') },
  { path: '/practice', icon: Gamepad2,  label: t('nav.practice') },
  { path: '/profile',  icon: User,      label: t('nav.profile') },
  { path: '/settings', icon: Settings,  label: t('nav.settings') },
])

const isActive = (path: string) =>
  path === '/' ? route.path === '/' : route.path.startsWith(path)

const navigateTo = (path: string) => {
  try { WebApp.HapticFeedback.impactOccurred('light') } catch { /* не в Telegram */ }
  if (route.path !== path) {
    router.push(path).then(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-1px_20px_rgba(0,0,0,0.06)] pb-safe"
  >
    <div class="flex items-stretch justify-around px-1 pt-1">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        @click="navigateTo(tab.path)"
        class="relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 min-w-0"
      >
        <!-- Активный фон-пилюля -->
        <div
          v-if="isActive(tab.path)"
          class="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-7 bg-primary/10 rounded-full transition-all duration-300"
        />

        <!-- Иконка -->
        <div :class="[
          'relative z-10 w-6 h-6 flex items-center justify-center transition-all duration-200',
          isActive(tab.path) ? 'scale-110' : ''
        ]">
          <component
            :is="tab.icon"
            :class="[
              'w-5 h-5 transition-all duration-200',
              isActive(tab.path) ? 'text-primary' : 'text-slate-400'
            ]"
          />
        </div>

        <!-- Лейбл -->
        <span :class="[
          'mt-0.5 text-[10px] font-semibold transition-all duration-200 truncate max-w-full',
          isActive(tab.path) ? 'text-primary' : 'text-slate-400'
        ]">
          {{ tab.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Телеграм и iOS safe area — контент не уходит под Home Indicator */
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 6px);
}
</style>
