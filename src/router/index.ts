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
    { path: '/unit/:id', component: () => import('../pages/UnitView.vue') },
    { path: '/lesson/:id', component: () => import('../pages/LessonView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('../pages/NotFoundView.vue') }
  ]
})

import { useUserStore } from '@/stores/user';
import WebApp from '@twa-dev/sdk';

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  const publicPages = ['/login', '/verify-email'];
  const authRequired = !publicPages.includes(to.path);
  const isTelegram = !!WebApp.initData;

  // If in Telegram, we assume App.vue handles login
  if (isTelegram) {
    next();
    return;
  }

  if (authRequired && !userStore.token) {
    next('/login');
  } else {
    next();
  }
});

export default router