<script setup lang="ts">
import { ref } from 'vue'
import WebApp from '@twa-dev/sdk'
import SplashScreen from '@/components/SplashScreen.vue' // <--- Импортируем

// Shadcn компоненты
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'

WebApp.ready()
WebApp.expand()

// Состояние загрузки
const isLoading = ref(true)

const onSplashFinished = () => {
  // Когда анимация загрузки прошла, меняем состояние
  isLoading.value = false
}

// ... остальная логика (кнопки и тд)
const progress = ref(33)
const checkAnswer = () => {
  WebApp.HapticFeedback.impactOccurred('medium')
  progress.value += 10
}
</script>

<template>
  <div class="relative min-h-screen bg-gray-50 overflow-hidden">

    <!-- 1. SPLASH SCREEN (Показываем пока isLoading = true) -->
    <!-- transition name="fade" делает плавное исчезновение -->
    <Transition v-if="isLoading" name="fade">
      <SplashScreen @finished="onSplashFinished" />
    </Transition>


    <!-- 2. ОСНОВНОЕ ПРИЛОЖЕНИЕ (Появляется, когда isLoading = false) -->
    <div v-else class="p-4 flex flex-col gap-6 h-screen">
      
      <!-- Заголовок -->
      <div 
        class="flex justify-between items-center"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
      >
        <h1 class="text-xl font-bold">Учим Kanji 🇯🇵</h1>
        <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">N5</span>
      </div>

      <!-- Прогресс -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
           <span>Прогресс урока</span>
           <span class="font-mono">{{ progress }}%</span>
        </div>
        <Progress :model-value="progress" class="h-2" />
      </div>

      <!-- Карточка -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', delay: 300 } }"
      >
        <Card class="w-full text-center shadow-lg border-0 bg-white relative overflow-hidden">
          <CardHeader class="relative z-10">
            <CardTitle class="text-7xl font-black text-gray-800 mb-2 mt-4">
              猫
            </CardTitle>
            <CardDescription class="text-lg font-medium text-gray-500">
              Кошка (Neko)
            </CardDescription>
          </CardHeader>
          <CardContent class="relative z-10 pb-8">
            <div class="grid grid-cols-2 gap-4 mt-4">
               <Button variant="outline" class="w-full h-14 text-lg rounded-xl">Inu</Button>
               <Button variant="default" class="w-full h-14 text-lg rounded-xl" @click="checkAnswer">Neko</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Шторка -->
      <div class="mt-auto">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="ghost" class="w-full text-gray-400">📚 Открыть словарь</Button>
          </SheetTrigger>
          <SheetContent side="bottom" class="h-[80vh] rounded-t-[24px]">
             <SheetHeader>
               <SheetTitle>Словарь</SheetTitle>
             </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

    </div>
  </div>
</template>

<style>
/* CSS для плавного исчезновения сплеш-скрина */
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>