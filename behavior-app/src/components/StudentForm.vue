<template>
  <q-card class="student-form-card">
    <q-card-section class="bg-primary text-white row items-center no-wrap">
      <q-icon :name="student ? 'edit' : 'person_add'" size="24px" class="q-mr-sm" />
      <div class="text-h6 col">{{ student ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่' }}</div>
      <q-btn flat round dense icon="close" aria-label="ปิด" v-close-popup />
    </q-card-section>

    <q-form ref="myForm" greedy @submit="onSave">
      <q-card-section class="q-gutter-y-sm">
        <q-input v-model="code" label="รหัสนักเรียน *" outlined autofocus inputmode="numeric"
          :rules="[val => !!(val && String(val).trim()) || 'กรุณากรอกรหัสนักเรียน']"
          :error="codeError ? true : null" :error-message="codeError">
          <template v-slot:prepend><q-icon name="badge" /></template>
        </q-input>

        <q-input v-model="name" label="ชื่อ - นามสกุล *" outlined hint="เช่น ด.ช.สมชาย ใจดี"
          :rules="[val => !!(val && val.trim()) || 'กรุณากรอกชื่อ - นามสกุล']">
          <template v-slot:prepend><q-icon name="person" /></template>
        </q-input>

        <q-select v-model="classroom" :options="CLASSROOM_OPTIONS" label="ชั้น/ห้อง *" outlined
          :rules="[val => !!val || 'กรุณาเลือกชั้น/ห้อง']">
          <template v-slot:prepend><q-icon name="school" /></template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="ยกเลิก" color="grey-8" v-close-popup />
        <q-btn type="submit" unelevated label="บันทึก" icon="save" color="primary" :loading="saving || checking" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { CLASSROOM_OPTIONS } from '@/config/app-config'
import { useStudentStore } from '@/stores/student-store'

const props = defineProps({
  student: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save'])

const myForm = ref(null)
const code = ref('')
const name = ref('')
const classroom = ref(null)
const codeError = ref('')
const checking = ref(false)

const studentStore = useStudentStore()

watch(code, () => {
  codeError.value = ''
})

onMounted(() => {
  if (props.student) {
    code.value = props.student.code
    name.value = props.student.name
    classroom.value = props.student.classroom
  }
})

const onSave = async () => {
  const newCode = String(code.value).trim()
  checking.value = true
  const taken = await studentStore.isCodeTaken(newCode, props.student?.id)
  checking.value = false
  if (taken) {
    codeError.value = 'รหัสนักเรียนนี้มีอยู่ในระบบแล้ว'
    return
  }
  emit('save', {
    code: newCode,
    name: name.value.trim(),
    classroom: classroom.value
  })
}
</script>

<style scoped>
.student-form-card {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
}
</style>
