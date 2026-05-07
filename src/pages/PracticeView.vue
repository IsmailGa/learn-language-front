<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import { Card, CardContent } from '@/components/ui/card'
import { useUserStore } from '@/stores/user'
import { RefreshCw, AlertTriangle, NotebookPen, Zap, Target, BookOpen, BarChart2, CheckCircle2, ClipboardList } from 'lucide-vue-next'
import type { Component } from 'vue'

WebApp.ready()
WebApp.expand()

const userStore = useUserStore()
const router = useRouter()

const practiceCategories = ref([
  {
    id: 1, title: 'Повторение', subtitle: 'Закрепи изученное',
    icon: RefreshCw as Component,
    color: 'hsl(var(--primary))',
    bgLight: 'hsl(var(--primary) / 0.08)', count: 12
  },
  {
    id: 2, title: 'Слабые места', subtitle: 'Ошибки прошлых уроков',
    icon: AlertTriangle as Component,
    color: 'hsl(var(--accent))',
    bgLight: 'hsl(var(--accent) / 0.08)', count: 5
  },
  {
    id: 3, title: 'Словарная практика', subtitle: 'Выучи новые слова',
    icon: NotebookPen as Component,
    color: 'hsl(var(--success))',
    bgLight: 'hsl(var(--success) / 0.08)', count: 8
  },
  {
    id: 4, title: 'Быстрая практика', subtitle: '5 минут на повторение',
    icon: Zap as Component,
    color: 'hsl(var(--warning))',
    bgLight: 'hsl(var(--warning) / 0.10)', count: 0
  },
])

const startPractice = (_categoryId: number) => {
  try { WebApp.HapticFeedback.impactOccurred('medium') } catch { }
  router.push('/practice/session')
}
</script>

<template>
  <div class="min-h-screen" style="background: hsl(var(--background))">

    <!-- Header -->
    <header class="sticky top-0 z-40 glass border-b border-border/60 shadow-sm">
      <div class="flex items-center justify-between px-4 h-14 container-fluid">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center"
            style="background: hsl(var(--primary))">
            <Zap class="w-4 h-4 text-white" />
          </div>
          <h1 class="font-black text-foreground text-lg" style="letter-spacing: -0.02em">Практика</h1>
        </div>
      </div>
    </header>

    <div class="container-fluid py-6 bottom-nav-offset space-y-6 max-w-3xl">

      <!-- Today's Progress Card -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { duration: 250 } }">
        <div class="progress-card rounded-2xl p-5 text-white relative overflow-hidden"
          style="background: hsl(var(--success))">
          <!-- Pattern -->
          <div class="absolute inset-0 opacity-10"
            style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;" />

          <div class="relative flex items-start justify-between mb-4">
            <div>
              <h3 class="font-black text-lg leading-tight">Сегодняшний прогресс</h3>
              <p class="text-sm opacity-70 font-medium mt-0.5">Продолжай в том же духе!</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Target class="w-5 h-5" />
            </div>
          </div>

          <div class="relative grid grid-cols-3 gap-3">
            <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <div class="text-2xl font-black tabular-nums">{{ userStore.user?.xp || 0 }}</div>
              <div class="text-[11px] opacity-70 font-bold uppercase tracking-wide">XP</div>
            </div>
            <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <div class="text-2xl font-black">15</div>
              <div class="text-[11px] opacity-70 font-bold uppercase tracking-wide">Упражнений</div>
            </div>
            <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <div class="text-2xl font-black">95%</div>
              <div class="text-[11px] opacity-70 font-bold uppercase tracking-wide">Точность</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice Categories -->
      <div>
        <h2 class="flex items-center gap-2 font-black text-foreground mb-4"
          style="font-size: clamp(1.125rem, 2.2vw, 1.5rem); letter-spacing: -0.02em">
          <BookOpen class="w-5 h-5" style="color: hsl(var(--primary))" />
          Режимы практики
        </h2>

        <div class="space-y-3">
          <div
            v-for="(category, index) in practiceCategories"
            :key="category.id"
            v-motion
            :initial="{ opacity: 0, x: -12 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 220, delay: index * 55 } }"
          >
            <div class="practice-card group" @click="startPractice(category.id)" role="button" tabindex="0">
              <!-- Left accent -->
              <div class="left-bar rounded-l-2xl" :style="{ background: category.gradient }" />

              <div class="flex items-center gap-4 p-4 pl-5 flex-1">
                <!-- Icon -->
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                  :style="{ background: category.color }">
                  <component :is="category.icon" class="w-6 h-6 text-white" />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h4 class="font-black text-foreground text-base leading-tight">{{ category.title }}</h4>
                  <p class="text-sm text-muted-foreground font-medium">{{ category.subtitle }}</p>
                  <div v-if="category.count > 0" class="mt-1.5">
                    <span class="badge badge-primary">
                      <ClipboardList class="w-3 h-3" />
                      {{ category.count }} упражнений
                    </span>
                  </div>
                </div>

                <!-- Arrow -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  :style="{ background: category.color }">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 250, delay: 300 } }">
        <h2 class="flex items-center gap-2 font-black text-foreground mb-4"
          style="font-size: clamp(1.125rem, 2.2vw, 1.5rem); letter-spacing: -0.02em">
          <BarChart2 class="w-5 h-5" style="color: hsl(var(--primary))" />
          Последняя активность
        </h2>

        <div class="rounded-2xl border border-border/60 overflow-hidden" style="background: hsl(var(--card))">
          <div class="divide-y divide-border/60">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                  style="background: hsl(var(--success) / 0.12)">
                  <CheckCircle2 class="w-5 h-5" style="color: hsl(var(--success))" />
                </div>
                <div>
                  <div class="font-bold text-foreground text-sm">Хангыль — Урок 4</div>
                  <div class="text-xs text-muted-foreground font-medium">2 часа назад</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-black text-sm" style="color: hsl(var(--success))">+15 XP</div>
                <div class="text-xs text-muted-foreground">100%</div>
              </div>
            </div>
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                  style="background: hsl(var(--primary) / 0.10)">
                  <CheckCircle2 class="w-5 h-5" style="color: hsl(var(--primary))" />
                </div>
                <div>
                  <div class="font-bold text-foreground text-sm">Повторение слов</div>
                  <div class="text-xs text-muted-foreground font-medium">Вчера</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-black text-sm" style="color: hsl(var(--primary))">+10 XP</div>
                <div class="text-xs text-muted-foreground">95%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.practice-card {
  display: flex;
  align-items: stretch;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border) / 0.7);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
  box-shadow: var(--shadow-sm);
  outline: none;
  position: relative;
}

.left-bar {
  width: 5px;
  flex-shrink: 0;
}

.practice-card:active {
  transform: scale(0.98);
}

@media (hover: hover) {
  .practice-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.practice-card:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3);
}
</style>
