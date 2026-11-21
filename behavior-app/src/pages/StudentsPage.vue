<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <div class="row items-center q-mb-md q-col-gutter-sm">
        <div class="col-12 col-sm">
          <div class="page-title">นักเรียน</div>
          <div class="page-subtitle">กด <b class="text-positive">+</b> / <b class="text-negative">−</b>
            เพื่อบันทึกคะแนนได้ทันที หรือกดชื่อเพื่อดูประวัติ</div>
        </div>
        <div v-if="authStore.role === 'admin'" class="col-12 col-sm-auto">
          <q-btn color="primary" icon="person_add" label="เพิ่มนักเรียน" unelevated rounded
            :class="{ 'full-width': $q.screen.xs }" @click="studentDialog = true" />
        </div>
      </div>

      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-md-6">
          <q-input v-model="searchText" outlined dense bg-color="white" placeholder="ค้นหาชื่อ หรือ รหัสนักเรียน"
            clearable debounce="200">
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-md-3">
          <q-select v-model="classroomFilter" :options="classroomOptions" outlined dense bg-color="white"
            label="ชั้น/ห้อง" />
        </div>
        <div class="col-6 col-md-3">
          <q-select v-model="sortBy" :options="sortOptions" emit-value map-options outlined dense bg-color="white"
            label="เรียงตาม" />
        </div>
      </div>

      <q-banner v-if="studentStore.errorMessage" class="bg-red-1 text-negative q-mb-md" rounded>
        <template #avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ studentStore.errorMessage }}
        <template v-slot:action>
          <q-btn flat color="negative" label="ลองอีกครั้ง" icon="refresh" @click="loadData" />
        </template>
      </q-banner>

      <q-list v-if="firstLoad" bordered separator class="rounded-borders bg-white">
        <q-item v-for="n in 6" :key="n">
          <q-item-section avatar><q-skeleton type="QAvatar" /></q-item-section>
          <q-item-section>
            <q-skeleton type="text" width="50%" />
            <q-skeleton type="text" width="30%" />
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else-if="filteredStudents.length === 0 && !studentStore.errorMessage"
        class="text-center q-pa-xl text-grey-7 bg-white rounded-borders">
        <q-icon name="person_search" size="4rem" color="grey-4" />
        <div class="text-subtitle1 q-mt-sm">ไม่พบนักเรียนที่ตรงกับเงื่อนไข</div>
        <q-btn v-if="hasFilter" flat color="primary" icon="filter_alt_off" label="ล้างตัวกรอง" class="q-mt-sm"
          @click="clearFilters" />
      </div>

      <div v-else-if="filteredStudents.length > 0">
        <div class="text-caption text-grey-7 q-mb-sm">พบ {{ filteredStudents.length }} คน</div>
        <q-list bordered separator class="rounded-borders bg-white">
          <q-item v-for="item in filteredStudents" :key="item.id" clickable v-ripple @click="viewStudent(item)">
            <q-item-section avatar>
              <ScoreAvatar :score="item.score" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body1 text-weight-medium">{{ item.name }}</q-item-label>
              <q-item-label caption>
                รหัส {{ item.code }} · {{ item.classroom }}
                <q-badge class="q-ml-xs" :color="item.level.color" :label="item.level.label" />
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row no-wrap q-gutter-xs">
                <q-btn round unelevated size="sm" color="green-1" text-color="positive" icon="add"
                  aria-label="เพิ่มคะแนน" @click.stop="openRecordForm(item, 'plus')">
                  <q-tooltip>เพิ่มคะแนน</q-tooltip>
                </q-btn>
                <q-btn round unelevated size="sm" color="red-1" text-color="negative" icon="remove"
                  aria-label="หักคะแนน" @click.stop="openRecordForm(item, 'minus')">
                  <q-tooltip>หักคะแนน</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
            <q-item-section side class="gt-xs">
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <q-dialog v-model="studentDialog" persistent>
      <StudentForm :saving="saving" @save="onCreateStudent" />
    </q-dialog>

    <q-dialog v-model="recordDialog" persistent>
      <RecordForm :type="recordType" :student-name="selectedStudent?.name" :current-score="selectedStudent?.score"
        :saving="saving" @save="onSaveRecord" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, useMeta } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'
import { useStudentStore } from '@/stores/student-store'
import { useRecordStore } from '@/stores/record-store'
import ScoreAvatar from '@/components/ScoreAvatar.vue'
import StudentForm from '@/components/StudentForm.vue'
import RecordForm from '@/components/RecordForm.vue'

useMeta({ title: 'นักเรียน' })
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const recordStore = useRecordStore()

const searchText = ref('')
const classroomFilter = ref('ทั้งหมด')
const sortBy = ref('code')
const studentDialog = ref(false)
const recordDialog = ref(false)
const recordType = ref('plus')
const selectedStudent = ref(null)
const saving = ref(false)

const sortOptions = [
  { label: 'รหัสนักเรียน', value: 'code' },
  { label: 'ชื่อ ก-ฮ', value: 'name' },
  { label: 'คะแนนน้อย → มาก', value: 'scoreAsc' },
  { label: 'คะแนนมาก → น้อย', value: 'scoreDesc' }
]
const sorters = {
  code: (a, b) => String(a.code).localeCompare(String(b.code)),
  name: (a, b) => a.name.localeCompare(b.name, 'th'),
  scoreAsc: (a, b) => a.score - b.score,
  scoreDesc: (a, b) => b.score - a.score
}

const firstLoad = computed(() =>
  (studentStore.loading || recordStore.loading) && studentStore.students.length === 0)

const classroomOptions = computed(() => {
  const list = ['ทั้งหมด']
  studentStore.students.forEach(item => {
    if (!list.includes(item.classroom)) {
      list.push(item.classroom)
    }
  })
  return list
})

const hasFilter = computed(() => !!searchText.value || classroomFilter.value !== 'ทั้งหมด')

const filteredStudents = computed(() => {
  const text = (searchText.value || '').trim().toLowerCase()
  return studentStore.students
    .filter(item => classroomFilter.value === 'ทั้งหมด' || item.classroom === classroomFilter.value)
    .filter(item => item.name.toLowerCase().includes(text) || String(item.code).includes(text))
    .map(item => {
      const score = recordStore.getScore(item.id)
      return { ...item, score, level: recordStore.getScoreLevel(score) }
    })
    .sort(sorters[sortBy.value])
})

const clearFilters = () => {
  searchText.value = ''
  classroomFilter.value = 'ทั้งหมด'
}

const viewStudent = (item) => {
  router.push({ name: 'studentDetail', params: { id: item.id } })
}

const openRecordForm = (student, type) => {
  selectedStudent.value = student
  recordType.value = type
  recordDialog.value = true
}

const onSaveRecord = async (data) => {
  saving.value = true
  const success = await recordStore.createRecord({
    studentId: selectedStudent.value.id,
    ...data,
    date: new Date().toISOString(),
    recordedBy: authStore.user.name
  })
  saving.value = false

  if (success) {
    recordDialog.value = false
    const isPlus = data.points > 0
    $q.notify({
      type: isPlus ? 'positive' : 'warning',
      icon: isPlus ? 'thumb_up' : 'thumb_down',
      message: `${selectedStudent.value.name} ${isPlus ? 'ได้รับ' : 'ถูกหัก'} ${Math.abs(data.points)} คะแนน`,
      caption: `${data.reason} · คะแนนปัจจุบัน ${recordStore.getScore(selectedStudent.value.id)}`
    })
  } else {
    $q.notify({ type: 'negative', message: recordStore.errorMessage })
  }
}

const onCreateStudent = async (data) => {
  saving.value = true
  const success = await studentStore.createStudent(data)
  saving.value = false
  if (success) {
    studentDialog.value = false
    $q.notify({ type: 'positive', message: `เพิ่ม ${data.name} เรียบร้อย`, icon: 'check_circle' })
  } else {
    $q.notify({ type: 'negative', message: studentStore.errorMessage })
  }
}

const loadData = async () => {
  await Promise.all([studentStore.fetchStudents(), recordStore.fetchRecords()])
}

onMounted(() => {
  loadData()
})
</script>
