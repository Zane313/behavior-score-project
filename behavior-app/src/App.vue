<template>
  <router-view />
</template>

<script setup>
import { useMeta } from 'quasar'

const appName = 'ระบบบันทึกคะแนนความประพฤตินักเรียน'

useMeta({
  title: '',
  titleTemplate: title => (title ? `${title} | ${appName}` : appName)
})
</script>
