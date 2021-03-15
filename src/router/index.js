import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
const router = new Router({
  // mode:'history',
  routes: [
    {
      path: '/index',
      name: 'index',
      meta: {
        title: 'index',
        auth: false, //需要登录
        keepAlive: false
      },
      component: resolve => require(['@/views/index.vue'], resolve)
    },
    {
      path: '/',
      name: 'test',
      meta: {
        title: 'test',
        auth: false, //需要登录
        keepAlive: false
      },
      component: resolve => require(['@/views/Test.vue'], resolve)
    },
    {
        path: '/hunj',
        name: 'hunj',
        meta: {
          title: 'hunj',
          auth: false, //需要登录
          keepAlive: false
        },
        component: resolve => require(['@/views/hunj.vue'], resolve)
      },
    {
      path: '/videoPlayer',
      name: 'videoPlayer',
      meta: {
        title: 'videoPlayer',
        auth: false, //需要登录
        keepAlive: false
      },
      component: resolve => require(['@/views/videoPlayer.vue'], resolve)
    }
  ]
})
/**
 * 路由前置检查
 */
router.beforeEach((to, from, next) => {
  // 合法性校验
  if (to.meta.auth) {
    next()
  }
  next()
})
router.afterEach(() => {
  // 在即将进入新的页面组件前操作
})
export default router
