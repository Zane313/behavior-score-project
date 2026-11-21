<template>
  <div>
    <div v-if="records.length === 0" class="text-center q-pa-xl text-grey-7 bg-white rounded-borders">
      <q-icon name="inbox" size="4rem" color="grey-4" />
      <div class="text-subtitle1 q-mt-sm">{{ emptyText }}</div>
    </div>

    <q-list v-else bordered separator class="rounded-borders bg-white">
      <q-item v-for="item in records" :key="item.id" :clickable="clickable" v-ripple="clickable"
        @click="clickable && emit('select', item)">
        <q-item-section avatar top>
          <q-avatar size="40px" :color="isPlus(item) ? 'green-1' : 'red-1'"
            :text-color="isPlus(item) ? 'positive' : 'negative'" :icon="isPlus(item) ? 'thumb_up' : 'thumb_down'" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-body1 text-weight-medium">{{ item.reason }}</q-item-label>
          <q-item-label v-if="item.studentName" caption class="text-grey-9">
            <q-icon name="person" /> {{ item.studentName }}
          </q-item-label>
          <q-item-label v-if="item.note" caption class="text-grey-8 record-note">{{ item.note }}</q-item-label>
          <q-item-label caption class="text-grey-6">
            <q-icon name="schedule" /> {{ formatDate(item.date) }}
            <span v-if="item.recordedBy"> · โดย {{ item.recordedBy }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <div class="row items-center no-wrap">
            <q-chip :color="isPlus(item) ? 'positive' : 'negative'" text-color="white" dense
              class="text-weight-bold points-chip">
              {{ isPlus(item) ? '+' : '' }}{{ item.points }}
            </q-chip>

            <template v-if="!readonly">
              <q-btn v-if="$q.screen.xs" flat round dense icon="more_vert" color="grey-7" aria-label="ตัวเลือก"
                @click.stop>
                <q-menu auto-close anchor="bottom right" self="top right">
                  <q-list style="min-width: 140px">
                    <q-item clickable @click="emit('edit', item)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>แก้ไข</q-item-section>
                    </q-item>
                    <q-item clickable class="text-negative" @click="emit('delete', item)">
                      <q-item-section avatar><q-icon name="delete_outline" color="negative" /></q-item-section>
                      <q-item-section>ลบ</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>

              <template v-else>
                <q-btn flat round dense icon="edit" color="grey-7" aria-label="แก้ไข" @click.stop="emit('edit', item)">
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="delete_outline" color="negative" aria-label="ลบ"
                  @click.stop="emit('delete', item)">
                  <q-tooltip>ลบ</q-tooltip>
                </q-btn>
              </template>
            </template>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { formatDate } from '@/config/app-config'

defineProps({
  records: {
    type: Array,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'ยังไม่มีประวัติการบันทึก'
  }
})

const emit = defineEmits(['edit', 'delete', 'select'])
const $q = useQuasar()

const isPlus = (item) => item.points > 0
</script>

<style scoped>
.record-note {
  font-style: italic;
}
.points-chip {
  min-width: 48px;
  justify-content: center;
}
</style>
