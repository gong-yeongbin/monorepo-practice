import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
// import Aura from '@primeuix/themes/aura'
import Aura from '@primeuix/themes/aura'

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(PrimeVue, { theme: { preset: Aura } })

app.mount('#app')
