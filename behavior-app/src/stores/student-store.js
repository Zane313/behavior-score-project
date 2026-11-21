import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/boot/axios'

export const useStudentStore = defineStore('student', () => {
  const students = ref([])
  const loading = ref(false)
  const errorMessage = ref('')

  const setError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage.value = 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่'
          break
        case 404:
          errorMessage.value = 'ไม่พบข้อมูลที่ต้องการ'
          break
        case 500:
          errorMessage.value = 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง'
          break
        default:
          errorMessage.value = `Unexpected Error (${error.response.status})`
          break
      }
    } else if (error.request) {
      errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
    } else {
      errorMessage.value = error.message
    }
    console.error(error)
  }

  async function fetchStudents() {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.get('/students')
      students.value = response.data
    } catch (error) {
      setError(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchStudentById(id) {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.get(`/students/${id}`)
      students.value = [response.data]
    } catch (error) {
      setError(error)
    } finally {
      loading.value = false
    }
  }

  function getStudentById(id) {
    return students.value.find(item => String(item.id) === String(id))
  }

  async function createStudent(newStudent) {
    try {
      const response = await api.post('/students', newStudent)
      students.value.push(response.data)
      return true
    } catch (error) {
      setError(error)
      return false
    }
  }

  async function updateStudent(id, updatedData) {
    try {
      const response = await api.put(`/students/${id}`, updatedData)
      const index = students.value.findIndex(item => String(item.id) === String(id))
      if (index !== -1) {
        students.value[index] = response.data
      }
      return true
    } catch (error) {
      setError(error)
      return false
    }
  }

  async function deleteStudent(id) {
    try {
      await api.delete(`/students/${id}`)
      students.value = students.value.filter(item => String(item.id) !== String(id))
      return true
    } catch (error) {
      setError(error)
      return false
    }
  }

  return {
    students, loading, errorMessage,
    fetchStudents, fetchStudentById, getStudentById, createStudent, updateStudent, deleteStudent
  }
})
