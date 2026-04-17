<template>
  <div class="min-h-screen bg-gray-900 text-white p-6 pb-24 font-sans selection:bg-green-500/30">
    <div class="max-w-md mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center gap-4 animate-in fade-in slide-in-from-top duration-500">
        <button @click="router.back()" class="p-2.5 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold tracking-tight">Character Practice</h1>
      </div>

      <!-- Main Card -->
      <div class="bg-gray-800/40 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-gray-700/50 space-y-8 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="text-center space-y-2">
          <p class="text-gray-400 text-sm font-medium tracking-wide uppercase">
            Current Character
          </p>
          <div class="flex justify-center text-8xl font-black py-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_10px_10px_rgba(255,255,255,0.1)]">
            {{ targetLetter }}
          </div>
        </div>
        
        <div class="relative">
          <DrawingCanvas @submit="handleSubmit" ref="canvasComponent" />
          
          <!-- Loading Overlay -->
          <div v-if="isLoading" class="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            <div class="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            <p class="text-green-500 font-bold animate-pulse">Analyzing...</p>
          </div>
        </div>

        <!-- Result Section -->
        <transition 
          enter-active-class="transform transition duration-500 ease-out" 
          enter-from-class="opacity-0 translate-y-4 scale-95" 
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transform transition duration-300 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="result" :class="[
            'p-6 rounded-2xl text-center space-y-3 border-2 backdrop-blur-md shadow-xl',
            isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          ]">
            <div class="flex items-center justify-center gap-2">
              <span v-if="isCorrect" class="text-3xl">✨</span>
              <span v-else class="text-3xl">⚡</span>
              <h2 class="text-2xl font-black underline-offset-8 decoration-wavy">{{ isCorrect ? 'Perfect Match!' : 'Not Quite...' }}</h2>
            </div>
            <p v-if="isCorrect" class="text-green-300/80 font-medium">Your stroke accuracy is impressive! Keep it up.</p>
            <p v-else class="text-red-300/80 font-medium whitespace-pre-line">{{ failureMessage }}</p>
            
            <button 
              @click="handleNext"
              :class="[
                'mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg',
                isCorrect ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40' : 'bg-gray-700 hover:bg-gray-600 text-gray-200 shadow-black'
              ]"
            >
              {{ isCorrect ? 'Continue' : 'Try Again' }}
            </button>
          </div>
        </transition>
      </div>

      <!-- Tips -->
      <div v-if="!result" class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3 items-start animate-bounce-short">
        <span class="text-blue-400 text-xl text-shadow-glow">💡</span>
        <p class="text-blue-300/80 text-sm leading-relaxed">
          Tip: Ensure your strokes are consistent and fill the bounding box for better recognition.
        </p>
      </div>
    </div>
    <BottomNav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DrawingCanvas from '../components/DrawingCanvas.vue';
import BottomNav from '../components/BottomNav.vue';
import api from '@/api/axios';

const router = useRouter();
const canvasComponent = ref<any>(null);
const isLoading = ref(false);
const result = ref<any>(null);
const targetLetter = ref('A');

const isCorrect = computed(() => {
  return result.value?.prediction?.toUpperCase() === targetLetter.value.toUpperCase();
});

const failureMessage = computed(() => {
  if (!result.value) return '';
  return `I recognized this as "${result.value.prediction}".\nDon't worry, practice makes perfect!`;
});

const handleSubmit = async (base64Image: string) => {
  isLoading.value = true;
  result.value = null;
  
  try {
    const response = await api.post('/v1/predict', { image: base64Image });
    result.value = response.data;
  } catch (err: any) {
    console.error("Failed to predict:", err);
    // Simple error mock to keep UX smooth
    result.value = { prediction: '?', success: false };
  } finally {
    isLoading.value = false;
  }
};

const handleNext = () => {
  if (isCorrect.value) {
    // Logic for next character would go here
    // For now we just reset
    resetExercise();
  } else {
    resetExercise();
  }
};

const resetExercise = () => {
  result.value = null;
  canvasComponent.value?.clearCanvas();
};
</script>

<style scoped>
.animate-bounce-short {
  animation: bounce-short 3s infinite;
}
@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.text-shadow-glow {
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
</style>

