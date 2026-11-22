<template>
  <q-card flat bordered class="full-height summary-card">
    <q-card-section class="row items-center no-wrap">
      <q-avatar :color="softColor" :text-color="color" :icon="icon" size="48px" class="q-mr-md" />
      <div class="col">
        <div class="text-caption text-grey-7 summary-title">{{ title }}</div>
        <q-skeleton v-if="loading" type="text" width="60px" height="32px" />
        <div v-else class="text-h5 text-weight-bold" :class="`text-${color}`">{{ value }}</div>
        <slot></slot>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: ''
  },
  icon: {
    type: String,
    default: 'info'
  },
  color: {
    type: String,
    default: 'primary'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const softColor = computed(() => {
  const map = {
    primary: 'blue-1',
    secondary: 'teal-1',
    accent: 'purple-1',
    positive: 'green-1',
    negative: 'red-1',
    warning: 'orange-1',
    info: 'light-blue-1'
  }
  return map[props.color] || 'grey-2'
})
</script>

<style scoped>
.summary-card {
  border-radius: 14px;
}

.summary-title {
  line-height: 1.3;
}
</style>
