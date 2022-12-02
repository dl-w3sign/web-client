import { createApp } from 'vue'
import '@/style.scss'
import App from '@/App.vue'
import { i18n } from '@/localization/i18n.js'
import router from '@/router/index.js'

const app = createApp(App)
app.use(i18n)
app.use(router)
app.mount('#app')
