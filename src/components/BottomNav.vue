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
  <nav class="bottom-nav md:hidden">
    <div class="nav-inner">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        @click="navigateTo(tab.path)"
        :class="['nav-item', { active: isActive(tab.path) }]"
        :aria-label="tab.label"
      >
        <!-- Active pill background -->
        <div v-if="isActive(tab.path)" class="active-pill" />

        <!-- Icon -->
        <div class="icon-wrap" :class="{ 'active': isActive(tab.path) }">
          <component :is="tab.icon" class="nav-icon" />
        </div>

        <!-- Label -->
        <span class="nav-label" :class="{ 'active': isActive(tab.path) }">
          {{ tab.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: hsl(var(--card) / 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid hsl(var(--border) / 0.7);
  box-shadow: 0 -4px 24px rgba(108, 99, 255, 0.07);
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 6px);
}

.nav-inner {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  padding: 6px 4px 0;
  height: var(--bottom-nav-height, 60px);
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 2px;
  min-width: 44px;
  min-height: 44px;
  padding: 4px 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 14px;
  transition: transform 120ms ease;
}

.nav-item:active {
  transform: scale(0.93);
}

/* Active glow pill */
.active-pill {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 30px;
  border-radius: 999px;
  background: hsl(var(--primary) / 0.12);
  pointer-events: none;
}

/* Icon wrapper */
.icon-wrap {
  position: relative;
  z-index: 1;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-wrap.active {
  transform: scale(1.15);
}

.nav-icon {
  width: 20px;
  height: 20px;
  transition: color 150ms;
  color: hsl(var(--muted-foreground));
}

.nav-item.active .nav-icon {
  color: hsl(var(--primary));
}

/* Label */
.nav-label {
  position: relative;
  z-index: 1;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  transition: color 150ms;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-label.active {
  color: hsl(var(--primary));
}
</style>
