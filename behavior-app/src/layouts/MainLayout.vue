<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="เปิด/ปิดเมนู" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bold">
          {{ $q.screen.xs ? shortTitle : appTitle }}
        </q-toolbar-title>

        <div v-if="authStore.user" class="row items-center no-wrap q-gutter-sm">
          <div class="gt-xs text-subtitle2">{{ authStore.user.name }}</div>
          <q-badge :color="roleColor" class="q-pa-xs text-weight-bold">{{ authStore.roleName }}</q-badge>
          <q-btn flat round dense icon="logout" aria-label="ออกจากระบบ" @click="onLogout">
            <q-tooltip>ออกจากระบบ</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="250">
      <div class="q-pa-md bg-blue-1">
        <q-avatar size="56px" :color="roleColor" text-color="white" :icon="roleIcon" />
        <div class="text-subtitle1 text-weight-bold q-mt-sm">{{ authStore.user?.name }}</div>
        <div class="text-caption text-grey-7">@{{ authStore.user?.username }} · {{ authStore.roleName }}</div>
      </div>

      <q-list padding>
        <q-item-label header>เมนู</q-item-label>
        <q-item v-for="menu in menus" :key="menu.name" clickable v-ripple :to="{ name: menu.name }"
          :exact="menu.exact" active-class="menu-active" @click="closeDrawerOnMobile">
          <q-item-section avatar>
            <q-icon :name="menu.icon" />
          </q-item-section>
          <q-item-section>{{ menu.label }}</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable v-ripple @click="onLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">ออกจากระบบ</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" v-if="Component" :key="route.path" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const leftDrawerOpen = ref(false)
const appTitle = 'ระบบบันทึกคะแนนความประพฤตินักเรียน'
const shortTitle = 'คะแนนความประพฤติ'

const menus = computed(() => {
  if (authStore.role === 'student') {
    return [
      { name: 'myScore', label: 'คะแนนของฉัน', icon: 'emoji_events', exact: true }
    ]
  }
  return [
    { name: 'dashboard', label: 'หน้าหลัก', icon: 'dashboard', exact: true },
    { name: 'students', label: 'นักเรียน / บันทึกคะแนน', icon: 'groups', exact: false },
    { name: 'records', label: 'ประวัติการบันทึก', icon: 'history', exact: true }
  ]
})

const roleColor = computed(() => {
  const colors = {
    admin: 'deep-orange',
    teacher: 'secondary',
    student: 'accent'
  }
  return colors[authStore.role] || 'grey'
})

const roleIcon = computed(() => {
  const icons = {
    admin: 'admin_panel_settings',
    teacher: 'school',
    student: 'face'
  }
  return icons[authStore.role] || 'person'
})

const closeDrawerOnMobile = () => {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false
  }
}

const onLogout = () => {
  $q.dialog({
    title: 'ออกจากระบบ',
    message: 'ต้องการออกจากระบบใช่หรือไม่?',
    cancel: { label: 'ยกเลิก', flat: true, color: 'grey-8' },
    ok: { label: 'ออกจากระบบ', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(() => {
    authStore.logout()
    $q.notify({
      type: 'positive',
      message: 'ออกจากระบบเรียบร้อย'
    })
    router.replace({ name: 'login' })
  })
}
</script>

<style scoped>
.menu-active {
  color: var(--q-primary);
  background: #e3eefc;
  font-weight: 700;
  border-right: 4px solid var(--q-primary);
}
</style>
