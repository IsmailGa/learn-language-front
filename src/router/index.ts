import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import SettingsView from '../pages/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/practice', component: () => import('../pages/PracticeView.vue') },
    { path: '/practice/session', component: () => import('../pages/PracticeSessionView.vue') },
    { path: '/profile', component: () => import('../pages/ProfileView.vue') },
    { path: '/settings', component: SettingsView },
    { path: '/login', component: () => import('../pages/LoginView.vue') },
    { path: '/verify-email', component: () => import('../pages/VerifyEmail.vue') },
    { path: '/alphabet', component: () => import('../pages/AlphabetView.vue') },
    { path: '/select-language', component: () => import('../pages/LanguageSelectionView.vue') },
    { path: '/unit/:id', component: () => import('../pages/UnitView.vue') },
    { path: '/lesson/:id', component: () => import('../pages/LessonView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('../pages/NotFoundView.vue') }
  ]
})

import { useUserStore } from '@/stores/user';
import WebApp from '@twa-dev/sdk';

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  const publicPages = ['/login', '/verify-email'];
  const authRequired = !publicPages.includes(to.path);
  const isTelegram = !!WebApp.initData;

  // If in Telegram, we assume App.vue handles login
  if (isTelegram) {
    if (to.path !== '/select-language' && userStore.user && !userStore.user.current_course_id) {
      next('/select-language');
      return;
    }
    next();
    return;
  }

  if (authRequired && !userStore.token) {
    next('/login');
  } else {
    // Check if course is selected
    if (userStore.token && !userStore.user) {
      try {
        await userStore.fetchProfile();
      } catch (e) {
        next('/login');
        return;
      }
    }

    if (userStore.user && !userStore.user.current_course_id && to.path !== '/select-language' && authRequired) {
      next('/select-language');
    } else {
      next();
    }
  }
});


export default router