<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Key, User, LogIn, Send, Sparkles } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref<string>('login');
const email = ref('');
const password = ref('');
const username = ref('');
const error = ref('');
const isLoading = ref(false);

const telegramWidgetContainer = ref<HTMLElement | null>(null);

const initTelegramWidget = () => {
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', 'learning_korean_isa_bot');
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  script.setAttribute('data-request-access', 'write');
  script.async = true;

  if (telegramWidgetContainer.value) {
    telegramWidgetContainer.value.innerHTML = '';
    telegramWidgetContainer.value.appendChild(script);
  }

  (window as any).onTelegramAuth = async (user: any) => {
    try {
      await userStore.loginWidget(user);
      router.push('/');
    } catch (e) {
      error.value = 'Telegram login failed';
    }
  };
};

onMounted(() => {
  initTelegramWidget();
  initGoogleButton();
});

const initGoogleButton = () => {
  const google = (window as any).google;
  if (google) {
    google.accounts.id.initialize({
      client_id: '818032901366-3pcvqv3j1mpa9g8ojrh2j2j71ko62i7v.apps.googleusercontent.com',
      callback: handleGoogleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("google-button"),
      { theme: "outline", size: "large", width: "100%" }
    );
  }
};

const handleGoogleCredentialResponse = async (response: any) => {
  try {
    await userStore.loginGoogle(response.credential);
    router.push('/');
  } catch (e) {
    error.value = 'Google login failed';
  }
};

const handleLogin = async () => {
  error.value = '';
  isLoading.value = true;
  try {
    await userStore.loginEmail({ email: email.value, password: password.value });
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Неверный email или пароль';
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  error.value = '';
  try {
    const result = await userStore.register({ email: email.value, password: password.value, username: username.value });
    if (result.data.success) {
      activeTab.value = 'login';
      error.value = '';
    }
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Ошибка регистрации';
  }
};
</script>

<template>
  <div class="login-page">
    <!-- Left panel (desktop) -->
    <div class="login-left hidden lg:flex">
      <div class="left-content">
        <!-- Logo -->
        <div class="left-logo">
          <div class="logo-icon">T</div>
          <span class="logo-text">tilgo</span>
        </div>
        <h1 class="left-headline">Learn any<br>language<br><span class="text-gradient">every day</span></h1>
        <p class="left-subtext">Изучай языки с искусственным интеллектом.<br>Интерактивно, увлекательно, эффективно.</p>

        <!-- Feature pills -->
        <div class="features">
          <div class="feature-pill">
            <span>🎮</span> Геймификация
          </div>
          <div class="feature-pill">
            <span>🤖</span> AI-распознавание
          </div>
          <div class="feature-pill">
            <span>🔥</span> Ежедневные серии
          </div>
          <div class="feature-pill">
            <span>📊</span> Прогресс
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel: form -->
    <div class="login-right">
      <div class="form-wrap">
        <!-- Mobile logo -->
        <div class="flex items-center gap-3 mb-8 lg:hidden">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
            style="background: hsl(var(--primary))">
            <span class="text-white font-black text-base" style="letter-spacing: -0.04em">T</span>
          </div>
          <span class="font-black text-foreground text-xl" style="letter-spacing: -0.03em">tilgo</span>
        </div>

        <div class="mb-6">
          <h2 class="font-black text-foreground" style="font-size: clamp(1.5rem, 3vw, 2rem); letter-spacing: -0.02em">
            {{ activeTab === 'login' ? 'С возвращением!' : 'Создай аккаунт' }}
          </h2>
          <p class="text-muted-foreground text-sm mt-1 font-medium">
            {{ activeTab === 'login' ? 'Войди, чтобы продолжить обучение' : 'Начни учить язык прямо сейчас' }}
          </p>
        </div>

        <Tabs v-model="activeTab" default-value="login" class="w-full">
          <!-- Tab switcher -->
          <TabsList class="grid w-full grid-cols-2 mb-6 h-11 rounded-xl p-1"
            style="background: hsl(var(--muted))">
            <TabsTrigger value="login"
              class="rounded-lg font-bold text-sm transition-all">
              Войти
            </TabsTrigger>
            <TabsTrigger value="register"
              class="rounded-lg font-bold text-sm transition-all">
              Регистрация
            </TabsTrigger>
          </TabsList>

          <!-- Login form -->
          <TabsContent value="login">
            <form @submit.prevent="handleLogin" class="space-y-4">
              <div class="space-y-1.5">
                <Label for="email" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" v-model="email" type="email" placeholder="you@example.com"
                    class="pl-10 h-12 rounded-xl font-medium" required />
                </div>
              </div>

              <div class="space-y-1.5">
                <Label for="password" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Пароль</Label>
                <div class="relative">
                  <Key class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" v-model="password" type="password" class="pl-10 h-12 rounded-xl font-medium" required />
                </div>
              </div>

              <div v-if="error" class="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl"
                style="background: hsl(var(--destructive) / 0.1); color: hsl(var(--destructive))">
                {{ error }}
              </div>

              <Button type="submit" class="w-full h-12 rounded-xl font-black text-base shadow-primary transition-all"
                style="background: hsl(var(--primary))"
                :disabled="isLoading">
                <span v-if="isLoading"
                  class="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
                <LogIn v-else class="mr-2 h-4 w-4" />
                {{ isLoading ? 'Входим...' : 'Войти' }}
              </Button>
            </form>

            <!-- Divider -->
            <div class="relative my-5">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-border" />
              </div>
              <div class="relative flex justify-center">
                <span class="px-3 text-xs font-semibold text-muted-foreground"
                  style="background: hsl(var(--card))">или войди через</span>
              </div>
            </div>

            <!-- Social -->
            <div class="space-y-3">
              <div id="google-button" class="w-full h-11" />
              <div ref="telegramWidgetContainer" class="flex justify-center w-full" />
            </div>
          </TabsContent>

          <!-- Register form -->
          <TabsContent value="register">
            <form @submit.prevent="handleRegister" class="space-y-4">
              <div class="space-y-1.5">
                <Label for="username" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Имя пользователя</Label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="username" v-model="username" type="text" placeholder="username"
                    class="pl-10 h-12 rounded-xl font-medium" required />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label for="r_email" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="r_email" v-model="email" type="email" placeholder="you@example.com"
                    class="pl-10 h-12 rounded-xl font-medium" required />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label for="r_password" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Пароль</Label>
                <div class="relative">
                  <Key class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="r_password" v-model="password" type="password"
                    class="pl-10 h-12 rounded-xl font-medium" required />
                </div>
              </div>

              <div v-if="error" class="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl"
                style="background: hsl(var(--destructive) / 0.1); color: hsl(var(--destructive))">
                {{ error }}
              </div>

              <Button type="submit" class="w-full h-12 rounded-xl font-black text-base shadow-primary"
                style="background: hsl(var(--primary))">
                <Send class="mr-2 h-4 w-4" /> Создать аккаунт
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────── */
.login-page {
  display: flex;
  min-height: 100dvh;
  background: hsl(var(--background));
}

/* ── Left decorative panel ───────────────────────────────────── */
.login-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #1A1A2E;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 56px;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -120px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.18);
  pointer-events: none;
}

.login-left::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: -60px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: hsl(var(--accent) / 0.14);
  pointer-events: none;
}

.left-content {
  position: relative;
  z-index: 1;
}

.left-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: hsl(var(--primary));
  box-shadow: 0 8px 32px hsl(var(--primary) / 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito', sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: white;
  letter-spacing: -0.05em;
  box-shadow: 0 8px 24px hsl(var(--primary) / 0.4);
}

.logo-text {
  font-family: 'Nunito', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  letter-spacing: -0.04em;
}

.left-headline {
  font-family: 'Nunito', sans-serif;
  font-size: clamp(2rem, 3.5vw, 3.25rem);
  font-weight: 900;
  color: white;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 20px;
}

.left-subtext {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.65;
  margin: 0 0 36px;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.8125rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

/* ── Right form panel ───────────────────────────────────────── */
.login-right {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: hsl(var(--background));
}

@media (min-width: 1024px) {
  .login-right {
    width: 440px;
    flex-shrink: 0;
    border-left: 1px solid hsl(var(--border) / 0.6);
  }
}

.form-wrap {
  width: 100%;
  max-width: 380px;
}
</style>
