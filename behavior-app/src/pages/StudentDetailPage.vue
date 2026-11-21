<template>
  <q-page class="q-pa-md">
    <div class="page-container">
    <q-btn flat dense no-caps color="primary" icon="arrow_back" label="กลับไปหน้านักเรียน" class="q-mb-sm"
      @click="goBack" />

    <div v-if="(studentStore.loading || recordStore.loading) && !student" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="50px" />
      <div class="text-grey-7 q-mt-sm">กำลังโหลดข้อมูล...</div>
    </div>

    <q-banner v-else-if="!student" class="bg-red-1 text-negative" rounded>
      <template #avatar>
        <q-icon name="error" color="negative" />
      </template>
      {{ studentStore.errorMessage || 'ไม่พบข้อมูลนักเรียน' }}
    </q-banner>

    <div v-else class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center profile-card">
          <q-card-section>
            <ScoreAvatar :score="score" size="110px" class="text-h4" />
            <div class="q-mt-sm">
              <q-badge :color="level.color" class="text-subtitle2 q-pa-sm">
                <q-icon :name="level.icon" class="q-mr-xs" /> {{ level.label }}
              </q-badge>
            </div>
            <div class="text-h6 text-weight-bold q-mt-md">{{ student.name }}</div>
            <div class="text-grey-7">รหัส {{ student.code }} · {{ student.classroom }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="row text-center">
            <div class="col">
              <div class="text-h6 text-positive">+{{ totalPlus }}</div>
              <div class="text-caption text-grey-7">คะแนนที่ได้เพิ่ม</div>
            </div>
            <div class="col">
              <div class="text-h6 text-negative">{{ totalMinus }}</div>
              <div class="text-caption text-grey-7">คะแนนที่ถูกหัก</div>
            </div>
          </q-card-section>

          <q-card-section :class="{ 'action-bar': $q.screen.xs }">
            <div class="row q-col-gutter-sm">
            <div class="col-6 col-sm-12">
              <q-btn color="positive" icon="add_circle" label="เพิ่มคะแนน" :size="$q.screen.xs ? 'md' : 'lg'"
                unelevated no-caps class="full-width" @click="openRecordForm('plus')" />
            </div>
            <div class="col-6 col-sm-12">
              <q-btn color="negative" icon="remove_circle" label="หักคะแนน" :size="$q.screen.xs ? 'md' : 'lg'"
                unelevated no-caps class="full-width" @click="openRecordForm('minus')" />
            </div>
            </div>
          </q-card-section>

          <q-card-actions v-if="authStore.role === 'admin'" align="center">
            <q-btn flat color="primary" icon="edit" label="แก้ไขข้อมูล" @click="studentDialog = true" />
            <q-btn flat color="negative" icon="delete" label="ลบนักเรียน" @click="confirmDeleteStudent = true" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <div class="row items-center q-mb-sm">
          <div class="text-h6 text-weight-bold col">ประวัติพฤติกรรม</div>
          <div class="text-caption text-grey-7">{{ history.length }} รายการ</div>
        </div>
        <RecordList :records="history" empty-text="ยังไม่มีประวัติ — เริ่มบันทึกด้วยปุ่มเพิ่ม/หักคะแนน"
          @edit="openEditRecord" @delete="askDeleteRecord" />
        <div v-if="$q.screen.xs" style="height: 72px" />
      </div>
    </div>
    </div>

    <q-dialog v-model="recordDialog" persistent>
      <RecordForm :type="recordType" :record="editingRecord" :student-name="student?.name"
        :current-score="score" :saving="saving" @save="onSaveRecord" />
    </q-dialog>

    <q-dialog v-model="studentDialog" persistent>
      <StudentForm :student="student" :saving="saving" @save="onUpdateStudent" />
    </q-dialog>

    <q-dialog v-model="confirmDeleteRecord" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="warning" color="orange" size="40px" class="q-mr-md" />
          <div>
            <div class="text-h6">ยืนยันการลบ</div>
            <div class="text-body2">ลบบันทึก "{{ deletingRecord?.reason }}"
              ({{ deletingRecord?.points > 0 ? '+' : '' }}{{ deletingRecord?.points }}) ใช่หรือไม่?</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
          <q-btn unelevated label="ลบ" color="negative" :loading="saving" @click="onDeleteRecord" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDeleteStudent" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="warning" color="negative" size="40px" class="q-mr-md" />
          <div>
            <div class="text-h6">ลบนักเรียน</div>
            <div class="text-body2">ลบ {{ student?.name }} และประวัติทั้งหมด {{ history.length }} รายการ ใช่หรือไม่?</div>
            <div class="text-caption text-negative q-mt-xs">การลบนักเรียนไม่สามารถกู้คืนได้</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
          <q-btn unelevated label="ลบ" color="negative" :loading="saving" @click="onDeleteStudent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, useMeta } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'
import { useStudentStore } from '@/stores/student-store'
import { useRecordStore } from '@/stores/record-store'
import ScoreAvatar from '@/components/ScoreAvatar.vue'
import RecordList from '@/components/RecordList.vue'
import RecordForm from '@/components/RecordForm.vue'
import StudentForm from '@/components/StudentForm.vue'

useMeta({ title: 'ข้อมูลนักเรียน' })
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const recordStore = useRecordStore()
const id = route.params.id

const recordDialog = ref(false)
const studentDialog = ref(false)
const confirmDeleteRecord = ref(false)
const confirmDeleteStudent = ref(false)
const recordType = ref('plus')
const editingRecord = ref(null)
const deletingRecord = ref(null)
const saving = ref(false)

const student = computed(() => studentStore.getStudentById(id))
const score = computed(() => recordStore.getScore(id))
const level = computed(() => recordStore.getScoreLevel(score.value))
const history = computed(() => recordStore.getRecordsOfStudent(id))

const totalPlus = computed(() => {
  let total = 0
  history.value.forEach(item => { if (item.points > 0) total = total + item.points })
  return total
})
const totalMinus = computed(() => {
  let total = 0
  history.value.forEach(item => { if (item.points < 0) total = total + item.points })
  return total
})

const openRecordForm = (type) => {
  recordType.value = type
  editingRecord.value = null
  recordDialog.value = true
}

const openEditRecord = (item) => {
  editingRecord.value = item
  recordDialog.value = true
}

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'students' })
  }
}

const onSaveRecord = async (data) => {
  saving.value = true
  let success = false
  if (editingRecord.value) {
    success = await recordStore.updateRecord(editingRecord.value.id, {
      ...editingRecord.value,
      ...data
    })
  } else {
    success = await recordStore.createRecord({
      studentId: student.value.id,
      ...data,
      date: new Date().toISOString(),
      recordedBy: authStore.user.name
    })
  }
  saving.value = false

  if (success) {
    recordDialog.value = false
    $q.notify({
      type: data.points > 0 ? 'positive' : 'warning',
      message: editingRecord.value
        ? `แก้ไขบันทึกเรียบร้อย : ${data.reason}`
        : `${data.points > 0 ? 'เพิ่ม' : 'หัก'} ${Math.abs(data.points)} คะแนน : ${data.reason}`,
      caption: `คะแนนปัจจุบัน ${score.value} คะแนน`,
      icon: data.points > 0 ? 'thumb_up' : 'thumb_down'
    })
  } else {
    $q.notify({ type: 'negative', message: recordStore.errorMessage })
  }
}

const askDeleteRecord = (item) => {
  deletingRecord.value = item
  confirmDeleteRecord.value = true
}

const onDeleteRecord = async () => {
  saving.value = true
  const deleted = { ...deletingRecord.value }
  const success = await recordStore.deleteRecord(deleted.id)
  saving.value = false
  confirmDeleteRecord.value = false
  if (success) {
    $q.notify({
      type: 'info',
      message: `ลบบันทึก "${deleted.reason}" แล้ว`,
      icon: 'delete',
      timeout: 6000,
      actions: [{
        label: 'เลิกทำ',
        color: 'white',
        handler: async () => {
          const data = { ...deleted }
          delete data.id
          const ok = await recordStore.createRecord(data)
          $q.notify(ok
            ? { type: 'positive', message: 'กู้คืนบันทึกแล้ว', icon: 'restore' }
            : { type: 'negative', message: recordStore.errorMessage })
        }
      }]
    })
  } else {
    $q.notify({ type: 'negative', message: recordStore.errorMessage })
  }
}

const onUpdateStudent = async (data) => {
  saving.value = true
  const success = await studentStore.updateStudent(id, { ...student.value, ...data })
  saving.value = false
  if (success) {
    studentDialog.value = false
    $q.notify({ type: 'positive', message: 'แก้ไขข้อมูลเรียบร้อย', icon: 'check_circle' })
  } else {
    $q.notify({ type: 'negative', message: studentStore.errorMessage })
  }
}

const onDeleteStudent = async () => {
  saving.value = true
  const name = student.value.name
  await recordStore.deleteRecordsOfStudent(id)
  const success = await studentStore.deleteStudent(id)
  saving.value = false
  confirmDeleteStudent.value = false
  if (success) {
    $q.notify({ type: 'positive', message: `ลบ ${name} เรียบร้อย`, icon: 'delete' })
    router.replace({ name: 'students' })
  } else {
    $q.notify({ type: 'negative', message: studentStore.errorMessage })
  }
}

onMounted(async () => {
  if (studentStore.students.length === 0) {
    await studentStore.fetchStudents()
  }
  await recordStore.fetchRecords()
})
</script>

<style scoped>
.profile-card {
  border-radius: 16px;
}
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: white;
  padding: 8px 12px 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
}
</style>
