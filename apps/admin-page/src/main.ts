import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from '@/apollo-client.ts'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})
const pinia = createPinia().use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(PrimeVue, { theme: { preset: Aura } })

app.mount('#app')
