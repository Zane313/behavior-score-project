<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <div class="page-title">ประวัติการบันทึก</div>
      <div class="page-subtitle q-mb-md">รายการบันทึกพฤติกรรมของนักเรียนทั้งหมด · กดที่แถวเพื่อดูนักเรียนคนนั้น</div>

      <q-banner v-if="recordStore.errorMessage" class="bg-red-1 text-negative q-mb-md" rounded>
        <template #avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ recordStore.errorMessage }}
        <template v-slot:action>
          <q-btn flat color="negative" label="ลองอีกครั้ง" icon="refresh" @click="loadData" />
        </template>
      </q-banner>

      <q-table :rows="rows" :columns="columns" row-key="id" :visible-columns="visibleColumns"
        :filter="filterText" v-model:pagination="pagination" :rows-per-page-options="[10, 20, 50, 0]"
        :pagination-label="paginationLabel" :loading="recordStore.loading || studentStore.loading"
        no-data-label="ยังไม่มีข้อมูล" no-results-label="ไม่พบข้อมูลที่ค้นหา" rows-per-page-label="แถวต่อหน้า"
        flat bordered class="records-table" @row-click="(evt, row) => viewStudent(row.studentId)">
        <template v-slot:top>
          <div class="row items-center q-col-gutter-sm full-width">
            <div class="col-12 col-md">
              <q-btn-toggle v-model="typeFilter" :options="typeOptions" unelevated no-caps rounded
                toggle-color="primary" color="grey-2" text-color="grey-9" :spread="$q.screen.xs" />
            </div>
            <div class="col-12 col-md-4">
              <q-input dense outlined debounce="300" v-model="filterText" placeholder="ค้นหาชื่อ ห้อง พฤติกรรม"
                clearable>
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
          </div>
        </template>

        <template v-slot:body-cell-studentName="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.studentName }}</div>
            <div v-if="$q.screen.xs" class="text-caption text-grey-7">
              {{ props.row.classroom }} · {{ props.row.reason }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-reason="props">
          <q-td :props="props">
            {{ props.row.reason }}
            <div v-if="props.row.note" class="text-caption text-grey-7 ellipsis" style="max-width: 220px">
              {{ props.row.note }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-points="props">
          <q-td :props="props">
            <q-chip :color="props.row.points > 0 ? 'positive' : 'negative'" text-color="white" dense
              class="text-weight-bold">
              {{ props.row.points > 0 ? '+' : '' }}{{ props.row.points }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-icon name="chevron_right" color="grey-6" size="20px" />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeta, useQuasar } from 'quasar'
import { useStudentStore } from '@/stores/student-store'
import { useRecordStore } from '@/stores/record-store'
import { formatDate } from '@/config/app-config'

useMeta({ title: 'ประวัติการบันทึก' })
const $q = useQuasar()
const router = useRouter()
const studentStore = useStudentStore()
const recordStore = useRecordStore()

const filterText = ref('')
const typeFilter = ref('all')
const typeOptions = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'เพิ่มคะแนน', value: 'plus', icon: 'thumb_up' },
  { label: 'หักคะแนน', value: 'minus', icon: 'thumb_down' }
]

const columns = [
  { name: 'date', label: 'วันที่', field: 'date', align: 'left', sortable: true, format: val => formatDate(val) },
  { name: 'studentName', label: 'นักเรียน', field: 'studentName', align: 'left', sortable: true },
  { name: 'classroom', label: 'ห้อง', field: 'classroom', align: 'left', sortable: true },
  { name: 'reason', label: 'พฤติกรรม', field: 'reason', align: 'left' },
  { name: 'points', label: 'คะแนน', field: 'points', align: 'center', sortable: true },
  { name: 'recordedBy', label: 'ผู้บันทึก', field: 'recordedBy', align: 'left' },
  { name: 'action', label: '', field: 'id', align: 'center' }
]

const visibleColumns = computed(() => {
  if ($q.screen.xs) return ['date', 'studentName', 'points']
  if ($q.screen.sm) return ['date', 'studentName', 'classroom', 'reason', 'points', 'action']
  return columns.map(col => col.name)
})

const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const paginationLabel = (start, end, total) => `${start}-${end} จาก ${total}`

const rows = computed(() => {
  return recordStore.records
    .filter(item => {
      if (typeFilter.value === 'plus') return item.points > 0
      if (typeFilter.value === 'minus') return item.points < 0
      return true
    })
    .map(item => {
      const student = studentStore.getStudentById(item.studentId)
      return {
        ...item,
        studentName: student ? student.name : '-',
        classroom: student ? student.classroom : '-'
      }
    })
})

const viewStudent = (studentId) => {
  router.push({ name: 'studentDetail', params: { id: studentId } })
}

const loadData = async () => {
  await Promise.all([studentStore.fetchStudents(), recordStore.fetchRecords()])
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.records-table {
  border-radius: 14px;
}
.records-table :deep(tbody tr) {
  cursor: pointer;
}
.records-table :deep(thead th) {
  font-weight: 700;
  color: #424242;
}
</style>
