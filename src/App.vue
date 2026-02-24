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

const showBottomNav = computed(() => {
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
    await userStore.fetchProfile();
  } else {
    await userStore.login();
  }
})
</script>

<template>
  <div class="app-container min-h-screen bg-gray-50">

    <Transition name="fade">
      <SplashScreen v-if="userStore.loading" />
    </Transition>

    <div v-if="!userStore.loading" class="flex flex-col md:flex-row min-h-screen">
      <!-- Sidebar for Desktop -->
      <Sidebar v-if="showBottomNav" />

      <!-- Main Content -->
      <main class="flex-1 w-full ml-0 transition-all duration-300" :class="{ 'md:ml-64 ': !isFullscreenPage }">
        <div :class="isFullscreenPage ? 'w-full h-full' : 'max-w-2xl mx-auto w-full h-full pb-20 md:pb-0 '">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>

      <!-- BottomNav for Mobile -->
      <BottomNav v-if="showBottomNav" class="md:hidden" />
    </div>

  </div>
</template>

<style>
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-leave-to {
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

body {
  margin: 0;
  background-color: #f9fafb;
  /* gray-50 */
}
</style>