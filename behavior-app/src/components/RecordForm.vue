<template>
  <q-card class="record-form-card">
    <q-card-section :class="isPlus ? 'bg-positive' : 'bg-negative'" class="text-white row items-center no-wrap">
      <q-icon :name="isPlus ? 'add_circle' : 'remove_circle'" size="28px" class="q-mr-sm" />
      <div class="col">
        <div class="text-h6">{{ record ? 'แก้ไขบันทึก' : (isPlus ? 'เพิ่มคะแนน' : 'หักคะแนน') }}</div>
        <div class="text-caption ellipsis">{{ studentName }}</div>
      </div>
      <q-btn flat round dense icon="close" aria-label="ปิด" v-close-popup />
    </q-card-section>

    <q-form ref="myForm" @submit="onSave">
      <q-card-section class="q-gutter-y-md">
        <div>
          <div class="text-subtitle2 q-mb-xs">พฤติกรรม <span class="text-negative">*</span></div>
          <q-field v-model="reason" borderless dense no-error-icon class="reason-field"
            :rules="[val => !!val || 'กรุณาเลือกพฤติกรรม']">
            <template #control>
              <div class="row q-gutter-xs q-pt-xs">
                <q-chip v-for="opt in reasonOptions" :key="opt.label" clickable
                  :outline="reason !== opt.label" :color="reason === opt.label ? mainColor : 'grey-7'"
                  :text-color="reason === opt.label ? 'white' : 'grey-9'"
                  :icon="reason === opt.label ? 'check' : undefined" @click="selectReason(opt)">
                  {{ opt.label }}
                </q-chip>
              </div>
            </template>
          </q-field>
        </div>

        <div>
          <div class="text-subtitle2 q-mb-xs">จำนวนคะแนน <span class="text-negative">*</span></div>
          <div class="row items-start q-col-gutter-sm">
            <div class="col-auto">
              <q-btn-toggle v-model="points" :options="quickPointOptions" unelevated no-caps
                :toggle-color="mainColor" color="grey-3" text-color="dark"
                class="quick-points" />
            </div>
            <div class="col">
              <q-input v-model.number="points" type="number" dense outlined :min="1" :max="MAX_POINTS"
                suffix="คะแนน" :rules="[
                  val => (val !== null && val !== '') || 'กรุณากรอกคะแนน',
                  val => (val >= 1 && val <= MAX_POINTS) || `ต้องอยู่ระหว่าง 1-${MAX_POINTS}`
                ]" />
            </div>
          </div>
        </div>

        <q-input v-model="note" type="textarea" autogrow outlined
          :label="reason === OTHER_REASON ? 'รายละเอียด *' : 'หมายเหตุ (ไม่บังคับ)'"
          :rules="[val => reason !== OTHER_REASON || !!(val && val.trim()) || 'กรุณาระบุรายละเอียดเมื่อเลือก “อื่น ๆ”']">
          <template v-slot:prepend><q-icon name="notes" /></template>
        </q-input>

        <div v-if="currentScore !== null && validPoints" class="score-preview row items-center justify-center q-pa-sm">
          <span class="text-grey-8">คะแนน</span>
          <span class="text-h6 text-weight-bold q-mx-sm">{{ currentScore }}</span>
          <q-icon name="arrow_forward" color="grey-7" />
          <span class="text-h6 text-weight-bold q-mx-sm" :class="`text-${mainColor}`">{{ newScore }}</span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="ยกเลิก" color="grey-8" v-close-popup />
        <q-btn type="submit" unelevated :label="record ? 'บันทึกการแก้ไข' : (isPlus ? 'เพิ่มคะแนน' : 'หักคะแนน')"
          icon="save" :color="mainColor" :loading="saving" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PLUS_REASONS, MINUS_REASONS, QUICK_POINTS, MAX_POINTS, OTHER_REASON } from '@/config/app-config'

const props = defineProps({
  type: {
    type: String,
    default: 'plus'
  },
  record: {
    type: Object,
    default: null
  },
  studentName: {
    type: String,
    default: ''
  },
  currentScore: {
    type: Number,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save'])

const myForm = ref(null)
const reason = ref(null)
const points = ref(QUICK_POINTS[0])
const note = ref('')

const quickPointOptions = QUICK_POINTS.map(p => ({ label: String(p), value: p }))

const isPlus = computed(() => {
  if (props.record) {
    return props.record.points > 0
  }
  return props.type === 'plus'
})

const mainColor = computed(() => (isPlus.value ? 'positive' : 'negative'))

const reasonOptions = computed(() => {
  const list = isPlus.value ? PLUS_REASONS : MINUS_REASONS
  if (props.record && !list.some(item => item.label === props.record.reason)) {
    return [{ label: props.record.reason, points: Math.abs(props.record.points) }, ...list]
  }
  return list
})

const selectReason = (opt) => {
  reason.value = opt.label
  if (!props.record) {
    points.value = opt.points
  }
}

const validPoints = computed(() => points.value >= 1 && points.value <= MAX_POINTS)
const signedPoints = computed(() => (isPlus.value ? points.value : -points.value))

const newScore = computed(() => {
  const oldPoints = props.record ? Number(props.record.points) : 0
  return props.currentScore - oldPoints + signedPoints.value
})

onMounted(() => {
  if (props.record) {
    reason.value = props.record.reason
    points.value = Math.abs(props.record.points)
    note.value = props.record.note || ''
  }
})

const onSave = () => {
  emit('save', {
    reason: reason.value,
    points: signedPoints.value,
    note: note.value.trim()
  })
}
</script>

<style scoped>
.record-form-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
}
.reason-field :deep(.q-field__control) {
  height: auto;
  min-height: 0;
}
.reason-field :deep(.q-field__native) {
  padding: 0;
}
.quick-points {
  border-radius: 8px;
  overflow: hidden;
}
.score-preview {
  background: #f5f7fa;
  border-radius: 10px;
}
</style>
