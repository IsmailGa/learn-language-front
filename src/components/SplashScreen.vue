<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  setTimeout(() => (visible.value = true), 50)
})
</script>

<template>
  <div class="splash">
    <div class="content" :class="{ visible }">

      <!-- Logo bubble -->
      <div class="logo-bubble">
        <span class="logo-text">T</span>
      </div>

      <!-- App name -->
      <h1 class="app-name">TilGo</h1>
      <p class="tagline">Learn any language, every day</p>

      <!-- Loading dots -->
      <div class="dots">
        <span class="dot" style="--d: 0s" />
        <span class="dot" style="--d: 0.15s" />
        <span class="dot" style="--d: 0.3s" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #1A1A2E;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.content.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Logo */
.logo-bubble {
  width: 88px;
  height: 88px;
  border-radius: 26px;
  background: #6C63FF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(108, 99, 255, 0.45);
  margin-bottom: 8px;
  animation: popIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.logo-text {
  font-family: 'Nunito', sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -0.04em;
}

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* Text */
.app-name {
  font-family: 'Nunito', sans-serif;
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.04em;
}

.tagline {
  font-family: 'Nunito', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  letter-spacing: 0.01em;
}

/* Loading dots */
.dots {
  display: flex;
  gap: 7px;
  margin-top: 36px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  animation: bounceDot 0.9s var(--d, 0s) ease-in-out infinite;
}

@keyframes bounceDot {
  0%, 80%, 100% { background: rgba(108, 99, 255, 0.3); transform: scale(1);   }
  40%           { background: #6C63FF;                  transform: scale(1.35); }
}
</style>