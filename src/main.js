import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let body = document.querySelector('body')
let appEl = document.createElement('div')
appEl.id = 'app'
body.appendChild(appEl)
console.log('kkkkk')
// console.log(body, appEl)

new Vue({
  render: h => h(App),
}).$mount('#app')
