import { defineBoot } from '#q-app'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const api = axios.create({ baseURL: import.meta.env.QCLI_API_URL || 'http://localhost:3000' })

api.interceptors.request.use((config) => {
  config.headers['Content-type'] = 'application/json; charset=UTF-8'
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
  }
  return config
}, (error) => { return Promise.reject(error) })

export default defineBoot(async ({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})
export { api }
