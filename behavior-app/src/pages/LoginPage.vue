<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center login-bg q-pa-md">
        <q-card class="login-card q-pa-lg">
          <div class="text-center q-mb-lg">
            <q-avatar size="72px" class="logo-glow" color="primary" text-color="white" icon="verified_user" />
            <div class="text-h5 text-weight-bold q-mt-md text-white">ระบบคะแนนความประพฤติ</div>
            <div class="text-caption text-blue-grey-3">กรุณาเข้าสู่ระบบเพื่อใช้งาน</div>
          </div>

          <q-form @submit="onLogin">
            <q-input v-model="username" dark outlined label="ชื่อผู้ใช้" class="q-mb-sm"
              :rules="[val => !!val || 'กรุณากรอกชื่อผู้ใช้']">
              <template #prepend><q-icon name="person" /></template>
            </q-input>

            <q-input v-model="password" dark outlined label="รหัสผ่าน"
              :type="showPassword ? 'text' : 'password'"
              :rules="[val => !!val || 'กรุณากรอกรหัสผ่าน']">
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>

            <q-btn type="submit" unelevated rounded color="primary" size="lg" label="เข้าสู่ระบบ"
              class="full-width q-mt-md" :loading="authStore.loading" />
          </q-form>

          <div class="text-center text-caption text-blue-grey-3 q-mt-lg q-mb-xs">บัญชีทดลอง (กดเพื่อเข้าสู่ระบบ)</div>
          <div class="row justify-center q-gutter-xs">
            <q-chip v-for="demo in demoAccounts" :key="demo.username" clickable outline color="white"
              :icon="demo.icon" @click="loginDemo(demo.username)">
              {{ demo.label }}
            </q-chip>
          </div>
        </q-card>

        <q-dialog v-model="showError">
          <q-card style="width: 300px">
            <q-card-section class="row items-center">
              <q-icon name="error" color="negative" size="sm" class="q-mr-sm" />
              <div class="text-h6">เข้าสู่ระบบไม่สำเร็จ</div>
            </q-card-section>
            <q-card-section>{{ authStore.errorMessage }}</q-card-section>
            <q-card-actions align="right">
              <q-btn v-close-popup flat label="ตกลง" color="primary" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const showError = ref(false)

const demoAccounts = [
  { username: 'admin', label: 'ผู้ดูแลระบบ', icon: 'admin_panel_settings' },
  { username: 'teacher', label: 'ครู', icon: 'school' },
  { username: 'student', label: 'นักเรียน', icon: 'face' }
]

const loginDemo = (name) => {
  username.value = name
  password.value = '123456'
  onLogin()
}

const onLogin = async () => {
  const success = await authStore.login(username.value, password.value)

  if (!success) {
    showError.value = true
    return
  }

  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: `ยินดีต้อนรับ ${authStore.user.name}`,
    caption: `สิทธิ์: ${authStore.roleName}`
  })

  if (route.query.redirect) {
    router.replace(route.query.redirect)
  } else if (authStore.role === 'student') {
    router.replace({ name: 'myScore' })
  } else {
    router.replace({ name: 'dashboard' })
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.logo-glow {
  box-shadow: 0 0 24px rgba(33, 150, 243, 0.7);
}
</style>
