<template>
  <q-avatar :color="level.color" text-color="white" :size="size" class="text-weight-bold">
    {{ score }}
  </q-avatar>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordStore } from '@/stores/record-store'

const props = defineProps({
  score: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    default: '44px'
  }
})

const recordStore = useRecordStore()
const level = computed(() => recordStore.getScoreLevel(props.score))
</script>
