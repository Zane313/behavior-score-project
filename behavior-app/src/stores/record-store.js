import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/boot/axios'
import { START_SCORE, SCORE_LEVELS } from '@/config/app-config'

export { START_SCORE }

export const useRecordStore = defineStore('record', () => {
  const records = ref([])
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

  const recentRecords = computed(() => {
    return [...records.value]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  })

  function getRecordsOfStudent(studentId) {
    return records.value
      .filter(item => String(item.studentId) === String(studentId))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  function getScore(studentId) {
    let score = START_SCORE
    records.value.forEach(item => {
      if (String(item.studentId) === String(studentId)) {
        score = score + Number(item.points)
      }
    })
    return score
  }

  function getScoreLevel(score) {
    return SCORE_LEVELS.find(level => score >= level.min)
  }

  async function fetchRecords() {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.get('/records')
      records.value = response.data
    } catch (error) {
      setError(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordsOfStudent(studentId) {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.get(`/records?studentId=${studentId}`)
      records.value = response.data
    } catch (error) {
      setError(error)
    } finally {
      loading.value = false
    }
  }

  async function createRecord(newRecord) {
    try {
      const response = await api.post('/records', newRecord)
      records.value.push(response.data)
      return true
    } catch (error) {
      setError(error)
      return false
    }
  }

  async function updateRecord(id, updatedData) {
    try {
      const response = await api.put(`/records/${id}`, updatedData)
      const index = records.value.findIndex(item => String(item.id) === String(id))
      if (index !== -1) {
        records.value[index] = response.data
      }
      return true
    } catch (error) {
      setError(error)
      return false
    }
  }

  async function deleteRecord(id) {
    try {
      await api.delete(`/records/${id}`)
      records.value = records.value.filter(item => String(item.id) !== String(id))
      return true
    } catch (error) {
      setError(error)
      return false
    }
  }

  async function deleteRecordsOfStudent(studentId) {
    const list = getRecordsOfStudent(studentId)
    for (const item of list) {
      await deleteRecord(item.id)
    }
  }

  return {
    records, loading, errorMessage,
    recentRecords,
    getRecordsOfStudent, getScore, getScoreLevel,
    fetchRecords, fetchRecordsOfStudent, createRecord, updateRecord, deleteRecord, deleteRecordsOfStudent
  }
})
