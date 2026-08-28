import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// Side-effect import: wires up the matchMedia listener for 'system' theme
// mode. The actual .dark class was already applied synchronously by the
// inline script in index.html, before this module even loads.
import './composables/useTheme'
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
