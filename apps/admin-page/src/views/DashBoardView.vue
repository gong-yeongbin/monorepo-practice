<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DataTable from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useDashboardStore } from '@/stores/dashboardStore.ts'
const dashboardStore = useDashboardStore()

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Seoul')

interface AdvertisingStatistic {
  id: number
  name: string
  click: number
  install: number
  registration: number
  retention: number
  purchase: number
  revenue: number
  etc1: number
  etc2: number
  etc3: number
  etc4: number
  etc5: number
  unregistered: number
}

const selectedDate = ref<Date>(new Date())
const advertisingStatistic = ref<AdvertisingStatistic[]>([])

onMounted(async () => {
  advertisingStatistic.value = await dashboardStore.update(
    dayjs(selectedDate.value).format('YYYY-MM-DD'),
  )
})

watch(selectedDate, async (newVal) => {
  if (newVal) {
    advertisingStatistic.value = await dashboardStore.update(dayjs(newVal).format('YYYY-MM-DD'))
  }
})
</script>

<template>
  <DefaultLayout>
    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center">
      <DatePicker v-model="selectedDate" dateFormat="yy-mm-dd" showIcon />
    </div>

    <DataTable :value="advertisingStatistic">
      <Column field="name" header="광고명">
        <template #body="{ data }">
          <router-link
            :to="{
              name: 'campaign',
              params: { id: data.id },
            }"
            style="color: #007bff; text-decoration: none"
          >
            {{ data.name }}
          </router-link>
        </template>
      </Column>

      <Column field="click" header="click" />
      <Column field="install" header="install" />
      <Column field="registration" header="registration" />
      <Column field="retention" header="retention" />
      <Column field="purchase" header="purchase" />
      <Column field="revenue" header="revenue" />
      <Column field="etc1" header="etc1" />
      <Column field="etc2" header="etc2" />
      <Column field="etc3" header="etc3" />
      <Column field="etc4" header="etc4" />
      <Column field="etc5" header="etc5" />
      <Column field="unregistered" header="unregistered" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped></style>
