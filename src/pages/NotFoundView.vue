<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
    router.push('/')
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div class="relative mb-8">
            <h1 class="text-9xl font-black text-slate-200 select-none">404</h1>
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-24 h-24 bg-primary/10 rounded-full animate-ping absolute"></div>
                <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center relative">
                    <span class="text-4xl">🤔</span>
                </div>
            </div>
        </div>

        <h2 class="text-2xl font-bold text-slate-800 mb-2">Страница не найдена</h2>
        <p class="text-slate-500 mb-8 max-w-xs mx-auto">
            Ой! Кажется, эта страница заблудилась в языковых кварталах.
        </p>

        <Button class="h-12 px-8 rounded-xl font-bold flex items-center gap-2" @click="goHome">
            <Home class="w-5 h-5 fill-current" />
            На главную
        </Button>
    </div>
</template>

<style scoped>
@keyframes ping {

    75%,
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.animate-ping {
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
