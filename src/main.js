import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import router from './router/index'
import Vuex from 'vuex'
import axios from './http/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as echarts from 'echarts'
import BMap from 'vue-baidu-map'

Vue.prototype.$echarts = echarts
Vue.prototype.$http = axios
Vue.prototype.BMap = BMap
Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(ElementUI)
Vue.use(BMap, {
  ak: 'ODcAFpZ6Ly7P6rkWi2UhxtE8OuiU0sdO'
})
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
