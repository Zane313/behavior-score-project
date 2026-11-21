<template>
  <q-page class="q-pa-md">
    <div class="page-container">
    <div class="page-title">คะแนนความประพฤติของฉัน</div>
    <div class="page-subtitle q-mb-md">ทุกคนเริ่มต้นที่ {{ START_SCORE }} คะแนน</div>

    <div v-if="(studentStore.loading || recordStore.loading) && !student" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="50px" />
      <div class="text-grey-7 q-mt-sm">กำลังโหลดข้อมูล...</div>
    </div>

    <q-banner v-else-if="!student" class="bg-red-1 text-negative" rounded>
      <template #avatar>
        <q-icon name="error" color="negative" />
      </template>
      {{ studentStore.errorMessage || 'ไม่พบข้อมูลนักเรียนของบัญชีนี้' }}
    </q-banner>

    <div v-else class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center score-card">
          <q-card-section :class="`bg-${level.color} text-white`">
            <q-icon :name="level.icon" size="48px" />
            <div class="text-h2 text-weight-bold">{{ score }}</div>
            <div class="text-subtitle1">ระดับ: {{ level.label }}</div>
            <div class="text-caption q-mt-xs next-level">
              <template v-if="nextLevel">อีก {{ nextLevel.need }} คะแนน จะถึงระดับ “{{ nextLevel.label }}”</template>
              <template v-else>ยอดเยี่ยม! รักษาระดับนี้ไว้นะ</template>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-h6">{{ student.name }}</div>
            <div class="text-grey-7">รหัส {{ student.code }} · {{ student.classroom }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-py-sm">
            <div class="row justify-center q-gutter-xs">
              <q-badge v-for="lv in levelLegend" :key="lv.label" :color="lv.color" :outline="lv.label !== level.label"
                :label="lv.text" class="q-pa-xs" />
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-sm q-mt-xs">
          <div class="col-6">
            <SummaryCard title="ได้เพิ่ม" :value="`+${totalPlus}`" icon="thumb_up" color="positive" />
          </div>
          <div class="col-6">
            <SummaryCard title="ถูกหัก" :value="totalMinus" icon="thumb_down" color="negative" />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-8">
        <div class="row items-center q-mb-sm">
          <div class="text-h6 text-weight-bold col">ประวัติพฤติกรรม</div>
          <div class="text-caption text-grey-7">{{ history.length }} รายการ</div>
        </div>
        <RecordList :records="history" readonly empty-text="ยังไม่มีประวัติ เก่งมาก!" />
      </div>
    </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMeta } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'
import { useStudentStore } from '@/stores/student-store'
import { useRecordStore } from '@/stores/record-store'
import { START_SCORE, SCORE_LEVELS } from '@/config/app-config'
import SummaryCard from '@/components/SummaryCard.vue'
import RecordList from '@/components/RecordList.vue'

useMeta({ title: 'คะแนนของฉัน' })
const authStore = useAuthStore()
const studentStore = useStudentStore()
const recordStore = useRecordStore()
const studentId = authStore.user?.studentId

const student = computed(() => studentStore.getStudentById(studentId))
const score = computed(() => recordStore.getScore(studentId))
const level = computed(() => recordStore.getScoreLevel(score.value))
const history = computed(() => recordStore.getRecordsOfStudent(studentId))

const nextLevel = computed(() => {
  const index = SCORE_LEVELS.findIndex(lv => lv.label === level.value.label)
  if (index <= 0) return null
  const next = SCORE_LEVELS[index - 1]
  return { label: next.label, need: next.min - score.value }
})

const levelLegend = computed(() => SCORE_LEVELS.map((lv, i) => {
  const upper = i > 0 ? SCORE_LEVELS[i - 1].min - 1 : null
  let text
  if (i === 0) text = `${lv.label} ${lv.min}+`
  else if (lv.min === -Infinity) text = `${lv.label} < ${upper + 1}`
  else text = `${lv.label} ${lv.min}-${upper}`
  return { ...lv, text }
}))

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

onMounted(async () => {
  await studentStore.fetchStudentById(studentId)
  await recordStore.fetchRecordsOfStudent(studentId)
})
</script>

<style scoped>
.score-card {
  border-radius: 16px;
  overflow: hidden;
}
.next-level {
  opacity: 0.9;
}
</style>
