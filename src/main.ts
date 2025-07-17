import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

// PrimeVue imports
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'

// Import PrimeIcons
import 'primeicons/primeicons.css'

const app = createApp(App)

// Configure PrimeVue
app.use(PrimeVue, {
  ripple: true
})

// Register directives
app.directive('tooltip', Tooltip)

app.mount('#app')