<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Эмитим событие, когда анимация закончилась
const emit = defineEmits(['finished'])

// Прогресс бар (фейковый для красоты)
const progress = ref(0)

onMounted(() => {
  // Симуляция загрузки от 0 до 100%
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 2 // Скорость загрузки
    } else {
      clearInterval(interval)
      // Небольшая задержка перед тем как убрать экран
      setTimeout(() => {
        emit('finished')
      }, 500)
    }
  }, 30)
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fffbf0] overflow-hidden">
    <!-- 1. Фоновый круг (Солнце) -->
    <!-- spring - эффект пружины при появлении -->
    <div
      class="absolute w-48 h-48 bg-red-500 rounded-full opacity-10 blur-xl"
      v-motion
      :initial="{ scale: 0, opacity: 0 }"
      :enter="{ 
        scale: 2.5, 
        opacity: 0.1, 
        transition: { duration: 1500, type: 'spring' } 
      }"
    ></div>

    <div class="relative z-10 flex flex-col items-center">
      <!-- 2. Красный круг (Четкий) -->
      <div 
        class="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-red-200"
        v-motion
        :initial="{ scale: 0 }"
        :enter="{ 
          scale: 1, 
          transition: { 
            type: 'spring', 
            stiffness: 200, 
            damping: 15, 
            delay: 200 
          } 
        }"
      >
        <!-- 3. Иероглиф 学 (Gaku - Учеба) -->
        <span 
          class="text-white text-6xl font-black mb-2 mr-1"
          v-motion
          :initial="{ opacity: 0, scale: 2, filter: 'blur(10px)' }"
          :enter="{ 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            transition: { duration: 800, delay: 600 } 
          }"
        >
          学
        </span>
      </div>

      <!-- 4. Текст и полоска загрузки -->
      <div 
        class="mt-12 flex flex-col items-center gap-3"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 1000 } }"
      >
        <h2 class="text-gray-400 font-medium tracking-widest text-sm uppercase">
          Loading Data
        </h2>
        
        <!-- Кастомный прогресс бар -->
        <div class="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-primary transition-all duration-100 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        
        <span class="text-xs text-gray-300 font-mono">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>