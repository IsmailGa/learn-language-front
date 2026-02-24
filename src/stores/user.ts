import { defineStore } from 'pinia';
import api from '@/api/axios';
import WebApp from '@twa-dev/sdk';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as any,
    token: localStorage.getItem('token') || null,
    loading: false,
    isTelegram: !!WebApp.initData,
  }),

  actions: {
    async login() {
      this.loading = true;
      try {
        const initData = WebApp.initData;

        // If explicitly called via button and not in TG, we should probably handle it differently
        // But this function seems to be designed for "Auto Login" or "In-App Login"
        if (!initData) {
          console.warn('Not in Telegram Web App');
          return;
        }

        const response = await api.post('/v1/auth/telegram', { initData });
        const { access_token, user } = response.data;

        this.token = access_token;
        this.user = user;
        localStorage.setItem('token', access_token);
        // Fetch full profile to get all fields
        await this.fetchProfile(true);
      } catch (error) {
        console.error('Login failed', error);
      } finally {
        this.loading = false;
      }
    },

    async loginWidget(widgetData: any) {
      this.loading = true;
      try {
        const response = await api.post('/v1/auth/telegram/widget', widgetData);
        const { access_token, user } = response.data;
        this.token = access_token;
        this.user = user;
        localStorage.setItem('token', access_token);

        await this.fetchProfile(true);
        return true;
      } catch (error) {
        console.error('Widget login failed', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loginGoogle(credential: string) {
      this.loading = true;
      try {
        const response = await api.post('/v1/auth/callback/google', { credential });
        const { access_token, user } = response.data;
        this.token = access_token;
        this.user = user;
        localStorage.setItem('token', access_token);

        await this.fetchProfile(true);
        return true;
      } catch (error) {
        console.error('Google login failed', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(data: any) {
      return await api.post('/v1/auth/register', data);
    },

    async loginEmail(data: any) {
      try {
        const response = await api.post('/v1/auth/login', data);
        const { access_token, user } = response.data;
        this.token = access_token;
        this.user = user;
        localStorage.setItem('token', access_token);

        await this.fetchProfile(true);
        return true;
      } catch (error) {
        throw error;
      }
    },

    async fetchProfile(force = false) {
      // If we already have user data and it's fresh (e.g. < 1 min old), skip
      // For now just check if user exists
      if (this.user && !force) return;

      this.loading = true;
      try {
        const response = await api.get('/v1/users/me');
        this.user = response.data;
        return this.user;
      } catch (error: any) {
        console.error('Fetch profile failed', error);
        // Only logout if it's a 401
        if (error.response && error.response.status === 401) {
          this.logout();
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      // If using router, might want to redirect here or in component
    }
  },
});