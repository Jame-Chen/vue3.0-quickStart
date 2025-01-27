import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import router from './router/index'
import Vuex from 'vuex'
import axios from './http/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/elementUI/elementUI.scss'
import * as echarts from 'echarts'
import VideoPlayer from 'vue-video-player'

Vue.prototype.$echarts = echarts
Vue.prototype.$http = axios
// Vue.prototype.BMap = BMap
Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(ElementUI)
// Vue.use(BMap, {
//   ak: 'ODcAFpZ6Ly7P6rkWi2UhxtE8OuiU0sdO'
// })
Vue.use(VideoPlayer)
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
