import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginService, getProfile } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const loading = ref(false)
  const errorMessage = ref('')

  const isAuthenticated = computed(() => accessToken.value !== null)

  const role = computed(() => user.value?.role ?? null)

  const roleName = computed(() => {
    const names = {
      admin: 'ผู้ดูแลระบบ',
      teacher: 'ครู',
      student: 'นักเรียน'
    }
    return names[role.value] || ''
  })

  const login = async (username, password) => {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await loginService(username, password)
      const found = response.data.find(
        item => item.username === username && item.password === password
      )
      if (!found) {
        errorMessage.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        return false
      }
      accessToken.value = found.token
      user.value = {
        id: found.id,
        username: found.username,
        name: found.name,
        role: found.role,
        studentId: found.studentId ?? null
      }
      return true
    } catch (error) {
      if (error.response) {
        errorMessage.value = `Server Error (${error.response.status})`
      } else if (error.request) {
        errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
      } else {
        errorMessage.value = error.message
      }
      console.error(error)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    accessToken.value = null
    user.value = null
    errorMessage.value = ''
    loading.value = false
  }

  const checkAuth = async () => {
    if (!accessToken.value || !user.value) {
      return false
    }

    try {
      await getProfile(user.value.id)
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    user, accessToken, loading, errorMessage,
    isAuthenticated, role, roleName,
    login, logout, checkAuth
  }
},
{
  persist: {
    pick: ['user', 'accessToken']
  }
})
