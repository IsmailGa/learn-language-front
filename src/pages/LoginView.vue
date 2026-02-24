<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Key, User, LogIn, Send } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref<string>('login');
const email = ref('');
const password = ref('');
const username = ref('');
const error = ref('');

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

const isLoading = ref(false);

const handleLogin = async () => {
    error.value = '';
    isLoading.value = true;
    try {
        await userStore.loginEmail({ email: email.value, password: password.value });
        router.push('/');
    } catch (e: any) {
        console.error("Login Error:", e);
        if (e.response && e.response.data && e.response.data.detail) {
            error.value = e.response.data.detail;
        } else {
            error.value = 'Неверный email или пароль';
        }
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
            // Optional: show success message
            error.value = '';
        }
    } catch (e: any) {
        if (e.response && e.response.data && e.response.data.detail) {
            error.value = e.response.data.detail;
        } else {
            error.value = 'Ошибка регистрации';
        }
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Tabs v-model="activeTab" default-value="login" class="w-full max-w-[400px]">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
                <Card v-motion :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <form @submit.prevent="handleLogin" class="space-y-4">
                            <div class="space-y-1">
                                <Label for="email">Email</Label>
                                <div class="relative">
                                    <Mail class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input id="email" v-model="email" type="email" placeholder="m@example.com"
                                        class="pl-9" required />
                                </div>
                            </div>
                            <div class="space-y-1">
                                <Label for="password">Password</Label>
                                <div class="relative">
                                    <Key class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input id="password" v-model="password" type="password" class="pl-9" required />
                                </div>
                            </div>

                            <div v-if="error" class="text-sm text-red-500 font-medium">{{ error }}</div>

                            <Button type="submit" class="w-full" :disabled="isLoading">
                                <LogIn v-if="!isLoading" class="mr-2 h-4 w-4" />
                                <span v-else
                                    class="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full"></span>
                                {{ isLoading ? 'Вход...' : 'Войти' }}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter class="flex flex-col gap-4">
                        <div class="relative w-full text-center text-sm text-muted-foreground">
                            <span class="bg-white px-2 relative z-10">Or continue with</span>
                            <div class="absolute inset-0 flex items-center">
                                <span class="w-full border-t"></span>
                            </div>
                        </div>

                        <!-- Google Button Placeholder -->
                        <div id="google-button" class="w-full h-[40px]"></div>

                        <!-- Telegram Widget -->
                        <div ref="telegramWidgetContainer" class="flex justify-center w-full"></div>
                    </CardFooter>
                </Card>
            </TabsContent>

            <TabsContent value="register">
                <Card v-motion :initial="{ opacity: 0, x: 20 }"
                    :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }">
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>
                            Create a new account to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <form @submit.prevent="handleRegister" class="space-y-4">
                            <div class="space-y-1">
                                <Label for="username">Username</Label>
                                <div class="relative">
                                    <User class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input id="username" v-model="username" type="text" placeholder="Username"
                                        class="pl-9" required />
                                </div>
                            </div>
                            <div class="space-y-1">
                                <Label for="r_email">Email</Label>
                                <div class="relative">
                                    <Mail class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input id="r_email" v-model="email" type="email" placeholder="m@example.com"
                                        class="pl-9" required />
                                </div>
                            </div>
                            <div class="space-y-1">
                                <Label for="r_password">Password</Label>
                                <div class="relative">
                                    <Key class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input id="r_password" v-model="password" type="password" class="pl-9" required />
                                </div>
                            </div>

                            <div v-if="error" class="text-sm text-red-500 font-medium">{{ error }}</div>

                            <Button type="submit" class="w-full">
                                <Send class="mr-2 h-4 w-4" /> Sign Up
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
</template>
