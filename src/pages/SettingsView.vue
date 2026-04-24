<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { BookOpen, LogOut, ChevronRight, Info } from 'lucide-vue-next'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getFlagCode } from '@/utils/flags'
import WebApp from '@twa-dev/sdk'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const showLogoutDialog = ref(false)

const confirmLogout = () => {
  userStore.logout()
  showLogoutDialog.value = false
  router.push('/login')
}

const changeCourse = () => {
  try { WebApp.HapticFeedback.impactOccurred('light') } catch { }
  router.push('/select-language')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24 md:pb-0">

    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div class="px-4 py-4 max-w-lg mx-auto">
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">{{ t('settings.title') }}</h1>
      </div>
    </header>

    <div class="max-w-lg mx-auto px-4 py-6 space-y-6">

      <!-- ── Текущий курс ─────────────────────────────────────────────────── -->
      <section>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
          {{ t('settings.app') }}
        </p>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            class="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
            @click="changeCourse"
          >
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <BookOpen class="w-5 h-5 text-emerald-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800">{{ t('settings.change_course') }}</p>
              <p class="text-xs text-slate-400 mt-0.5 truncate">
                <!-- Показываем текущий курс/язык если выбран -->
                <template v-if="userStore.user?.current_course_id">
                  {{ t('select_language.subtitle') }}
                </template>
                <template v-else>
                  Язык не выбран — нажмите для выбора
                </template>
              </p>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-300 shrink-0" />
          </button>
        </div>

        <!-- Подсказка -->
        <div class="flex items-start gap-2 mt-3 px-1">
          <Info class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p class="text-xs text-slate-400">
            При смене курса язык интерфейса изменится автоматически в соответствии с вашим родным языком.
          </p>
        </div>
      </section>

      <!-- ── Аккаунт ───────────────────────────────────────────────────────── -->
      <section>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
          {{ t('settings.account') }}
        </p>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            class="w-full flex items-center gap-4 p-5 hover:bg-red-50 transition-colors text-left"
            @click="showLogoutDialog = true"
          >
            <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <LogOut class="w-5 h-5 text-red-500" />
            </div>
            <p class="font-semibold text-red-500">{{ t('settings.logout') }}</p>
          </button>
        </div>
      </section>

    </div>

    <!-- Logout Dialog -->
    <Dialog v-model:open="showLogoutDialog">
      <DialogContent class="sm:max-w-md w-[calc(100%-2rem)] rounded-3xl p-6">
        <DialogHeader>
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut class="w-7 h-7 text-red-500" />
          </div>
          <DialogTitle class="text-center text-xl font-bold">{{ t('settings.logout') }}</DialogTitle>
          <DialogDescription class="text-center text-slate-500 pt-1">
            {{ t('settings.logout_confirm') }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-col sm:flex-col gap-3 pt-4">
          <Button class="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-white" @click="confirmLogout">
            {{ t('auth.logout') }}
          </Button>
          <Button variant="outline" class="w-full h-12 rounded-xl font-bold" @click="showLogoutDialog = false">
            {{ t('common.cancel') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>
