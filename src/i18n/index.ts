import { createI18n } from 'vue-i18n'
import ru from './locales/ru'
import en from './locales/en'
import uz from './locales/uz'

// Определяем язык: сначала localStorage, потом браузер, иначе 'ru'
function detectLocale(): string {
  const saved = localStorage.getItem('locale')
  if (saved && ['ru', 'en', 'uz'].includes(saved)) return saved

  const browserLang = navigator.language.split('-')[0]
  if (['ru', 'en', 'uz'].includes(browserLang)) return browserLang

  return 'ru'
}

export const SUPPORTED_LOCALES = [
  { code: 'ru', label: 'Русский', flag: 'ru' },
  { code: 'en', label: 'English', flag: 'us' },
  { code: 'uz', label: "O'zbek", flag: 'uz' },
] as const

export type LocaleCode = 'ru' | 'en' | 'uz'

const i18n = createI18n({
  legacy: false,          // обязательно для Composition API
  locale: detectLocale(),
  fallbackLocale: 'ru',
  messages: { ru, en, uz },
})

export default i18n
