<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <div class="row items-center q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm">
          <div class="page-title">สวัสดี, {{ authStore.user?.name }}</div>
          <div class="page-subtitle">ภาพรวมคะแนนความประพฤตินักเรียน</div>
        </div>
        <div class="col-12 col-sm-auto">
          <q-btn color="primary" icon="edit_note" label="บันทึกพฤติกรรม" unelevated rounded
            :class="{ 'full-width': $q.screen.xs }" :to="{ name: 'students' }" />
        </div>
      </div>

      <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mb-md" rounded>
        <template #avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ errorMessage }}
        <template v-slot:action>
          <q-btn flat color="negative" label="ลองอีกครั้ง" icon="refresh" @click="loadData" />
        </template>
      </q-banner>

      <div class="row q-col-gutter-md">
        <div class="col-6 col-md-3">
          <SummaryCard title="นักเรียนทั้งหมด" :value="studentStore.students.length" icon="groups" color="primary"
            :loading="firstLoad" />
        </div>
        <div class="col-6 col-md-3">
          <SummaryCard title="คะแนนเฉลี่ย" :value="averageScore" icon="insights" color="secondary"
            :loading="firstLoad" />
        </div>
        <div class="col-6 col-md-3">
          <SummaryCard title="บันทึกทั้งหมด" :value="recordStore.records.length" icon="fact_check" color="accent"
            :loading="firstLoad" />
        </div>
        <div class="col-6 col-md-3">
          <SummaryCard title="ต้องเฝ้าระวัง" :value="watchList.length" icon="warning"
            :color="watchList.length > 0 ? 'negative' : 'positive'" :loading="firstLoad" />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="section-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="warning" color="warning" size="24px" class="q-mr-sm" />
              <div class="text-subtitle1 text-weight-bold col">นักเรียนที่ต้องเฝ้าระวัง</div>
              <q-badge outline color="grey-7" :label="`ต่ำกว่า ${WATCH_THRESHOLD} คะแนน`" />
            </q-card-section>
            <q-separator />

            <div v-if="firstLoad" class="q-pa-md">
              <q-skeleton v-for="n in 3" :key="n" type="QItem" class="q-mb-sm" />
            </div>

            <div v-else-if="watchList.length === 0" class="text-center q-pa-lg text-grey-7">
              <q-icon name="celebration" size="3rem" color="positive" />
              <div class="q-mt-sm">ไม่มีนักเรียนที่ต้องเฝ้าระวัง</div>
            </div>

            <q-list v-else separator>
              <q-item v-for="item in watchList" :key="item.id" clickable v-ripple @click="viewStudent(item.id)">
                <q-item-section avatar>
                  <ScoreAvatar :score="item.score" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body1 text-weight-medium">{{ item.name }}</q-item-label>
                  <q-item-label caption>รหัส {{ item.code }} · {{ item.classroom }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="recordStore.getScoreLevel(item.score).color"
                    :label="recordStore.getScoreLevel(item.score).label" />
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card flat bordered class="section-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="history" color="primary" size="24px" class="q-mr-sm" />
              <div class="text-subtitle1 text-weight-bold col">บันทึกล่าสุด</div>
              <q-btn flat dense no-caps color="primary" label="ดูทั้งหมด" icon-right="chevron_right"
                :to="{ name: 'records' }" />
            </q-card-section>
            <q-separator />
            <div v-if="firstLoad" class="q-pa-md">
              <q-skeleton v-for="n in 3" :key="n" type="QItem" class="q-mb-sm" />
            </div>
            <RecordList v-else :records="recentWithName" readonly clickable class="no-outer-border"
              @select="item => viewStudent(item.studentId)" />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeta, useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'
import { useStudentStore } from '@/stores/student-store'
import { useRecordStore } from '@/stores/record-store'
import { WATCH_THRESHOLD } from '@/config/app-config'
import SummaryCard from '@/components/SummaryCard.vue'
import ScoreAvatar from '@/components/ScoreAvatar.vue'
import RecordList from '@/components/RecordList.vue'

useMeta({ title: 'หน้าหลัก' })
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const recordStore = useRecordStore()

const isLoading = computed(() => studentStore.loading || recordStore.loading)
const errorMessage = computed(() => studentStore.errorMessage || recordStore.errorMessage)

const firstLoad = computed(() => isLoading.value && studentStore.students.length === 0)

const studentsWithScore = computed(() => {
  return studentStore.students.map(item => ({
    ...item,
    score: recordStore.getScore(item.id)
  }))
})

const averageScore = computed(() => {
  if (studentsWithScore.value.length === 0) return 0
  let total = 0
  studentsWithScore.value.forEach(item => { total = total + item.score })
  return (total / studentsWithScore.value.length).toFixed(1)
})

const watchList = computed(() => {
  return studentsWithScore.value
    .filter(item => item.score < WATCH_THRESHOLD)
    .sort((a, b) => a.score - b.score)
})

const recentWithName = computed(() => {
  return recordStore.recentRecords.map(item => ({
    ...item,
    studentName: studentStore.getStudentById(item.studentId)?.name ?? '-'
  }))
})

const viewStudent = (id) => {
  router.push({ name: 'studentDetail', params: { id } })
}

const loadData = async () => {
  await Promise.all([studentStore.fetchStudents(), recordStore.fetchRecords()])
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.section-card {
  border-radius: 14px;
  overflow: hidden;
}
.no-outer-border :deep(.q-list--bordered) {
  border: none;
  border-radius: 0;
}
</style>
