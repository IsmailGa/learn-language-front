<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  // Small delay so the animation feels intentional
  setTimeout(() => (visible.value = true), 50)
})
</script>

<template>
  <div class="splash">
    <div class="content" :class="{ visible }">

      <!-- Logo bubble -->
      <div class="logo-bubble">
        <div class="bubble-icon">🌍</div>
      </div>

      <!-- App name -->
      <h1 class="app-name">LinguaApp</h1>
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
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

.splash {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Center column */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.content.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Logo */
.logo-bubble {
  width: 96px;
  height: 96px;
  border-radius: 28px;
  background: #58cc02;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 #46a302;
  margin-bottom: 8px;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.bubble-icon {
  font-size: 3rem;
  line-height: 1;
  margin-top: 2px;
}

@keyframes popIn {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* Text */
.app-name {
  font-family: 'Nunito', sans-serif;
  font-size: 2rem;
  font-weight: 900;
  color: #1f1f1f;
  margin: 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-family: 'Nunito', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #afafaf;
  margin: 0;
  letter-spacing: 0.01em;
}

/* Loading dots */
.dots {
  display: flex;
  gap: 6px;
  margin-top: 32px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e5e5;
  animation: bounce 0.9s var(--d, 0s) ease-in-out infinite;
}

@keyframes bounce {
  0%, 80%, 100% { background: #e5e5e5; transform: scale(1); }
  40%           { background: #58cc02; transform: scale(1.3); }
}
</style>