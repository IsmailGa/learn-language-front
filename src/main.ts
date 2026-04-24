import { createApp } from 'vue'
import './style.css'
import 'flag-icons/css/flag-icons.min.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import router from './router'
import i18n from './i18n'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // Persist stores (locale, token, etc.)

const app = createApp(App)

app.use(pinia)
app.use(MotionPlugin)
app.use(router)
app.use(i18n)
app.mount('#app')