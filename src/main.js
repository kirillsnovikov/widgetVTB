import Vue from 'vue'
import App from './App.vue'

import './assets/scss/main.scss'

Vue.config.productionTip = false

let body = document.querySelector('body')
let appEl = document.createElement('div')
appEl.id = 'auth_widget'
body.appendChild(appEl)

new Vue({
  render: h => h(App),
}).$mount('#auth_widget')
