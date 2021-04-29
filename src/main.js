import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import VueCalendarHeatmap from 'vue-calendar-heatmap/dist/vue-calendar-heatmap.common'
import 'vue-calendar-heatmap/dist/vue-calendar-heatmap.css'

Vue.config.productionTip = false

Vue.use(VueToast);
Vue.use(VueCalendarHeatmap)


new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
