<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import SplashScreen from '@/components/SplashScreen.vue'
import BottomNav from '@/components/BottomNav.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
const route = useRoute()

const showNav = computed(() => {
  const publicPages = ['/login', '/verify-email']
  const fullscreenPrefixes = ['/lesson/', '/practice/session']
  const isFullscreen = fullscreenPrefixes.some(p => route.path.startsWith(p))
  return !publicPages.includes(route.path) && !isFullscreen && !!userStore.user && !userStore.loading
})

const isFullscreenPage = computed(() => {
  return ['/login', '/lesson/', '/practice/session'].some(p => route.path.startsWith(p))
})

onMounted(async () => {
  WebApp.ready()
  WebApp.expand()

  if (userStore.token) {
    await userStore.fetchProfile()
  } else {
    await userStore.login()
  }
})
</script>

<template>
  <div class="app-root">

    <!-- Splash screen -->
    <Transition name="fade">
      <SplashScreen v-if="userStore.loading" />
    </Transition>

    <div v-if="!userStore.loading" class="app-layout">

      <!-- Sidebar: Compact (md) + Full (lg+) -->
      <Sidebar v-if="showNav" />

      <!-- Main content area -->
      <main
        class="app-main"
        :class="{
          'with-sidebar': showNav && !isFullscreenPage,
          'fullscreen': isFullscreenPage
        }"
      >
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- Bottom Nav — mobile only -->
      <BottomNav v-if="showNav" />
    </div>
  </div>
</template>

<style>
/* ── Root ───────────────────────────────────────────────────── */
.app-root {
  min-height: 100dvh;
  background: hsl(var(--background));
}

.app-layout {
  display: flex;
  min-height: 100dvh;
}

/* ── Main content ─────────────────────────────────────────── */
.app-main {
  flex: 1;
  min-width: 0;
  width: 100%;
  /* Offset for mobile bottom nav */
  padding-bottom: calc(var(--bottom-nav-height, 60px) + env(safe-area-inset-bottom, 0px) + 8px);
}

/* Tablet: offset for compact sidebar */
@media (min-width: 768px) {
  .app-main.with-sidebar {
    margin-left: var(--sidebar-compact-width, 72px);
    padding-bottom: 0;
  }
}

/* Desktop: offset for full sidebar */
@media (min-width: 1024px) {
  .app-main.with-sidebar {
    margin-left: var(--sidebar-width, 240px);
  }
}

/* Fullscreen pages (lesson, practice session) */
.app-main.fullscreen {
  margin-left: 0 !important;
  padding-bottom: 0 !important;
}

/* ── Transitions ──────────────────────────────────────────── */
.fade-leave-active {
  transition: opacity 0.45s ease;
}
.fade-leave-to {
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>