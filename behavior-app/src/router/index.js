import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import routes from './routes.js'
import { useAuthStore } from '@/stores/auth-store.js'
import { Notify } from 'quasar'

const homeOfRole = (role) => {
  switch (role) {
    case 'admin':
    case 'teacher':
      return { name: 'dashboard' }
    default:
      return { name: 'myScore' }
  }
}

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.name === 'login' && authStore.isAuthenticated) {
      return next(homeOfRole(authStore.role))
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      if (from.name) {
        Notify.create({ type: 'warning', message: 'กรุณาเข้าสู่ระบบก่อน' })
      }
      const query = to.fullPath !== '/' ? { redirect: to.fullPath } : {}
      return next({ name: 'login', query })
    }

    if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
      if (to.path !== '/') {
        Notify.create({ type: 'negative', message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้' })
      }
      return next(homeOfRole(authStore.role))
    }

    next()
  })

  return Router
})
