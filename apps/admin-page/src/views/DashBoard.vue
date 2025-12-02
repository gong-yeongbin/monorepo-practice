<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'

interface AdvertisingStatistic {
  advertisingName: string
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

const calcSummary = (rows: AdvertisingStatistic[]): AdvertisingStatistic => {
  return rows.reduce<AdvertisingStatistic>(
    (acc, curr) => ({
      advertisingName: '합계',
      click: acc.click + curr.click,
      install: acc.install + curr.install,
      registration: acc.registration + curr.registration,
      retention: acc.retention + curr.retention,
      purchase: acc.purchase + curr.purchase,
      revenue: acc.revenue + curr.revenue,
      etc1: acc.etc1 + curr.etc1,
      etc2: acc.etc2 + curr.etc2,
      etc3: acc.etc3 + curr.etc3,
      etc4: acc.etc4 + curr.etc4,
      etc5: acc.etc5 + curr.etc5,
      unregistered: acc.unregistered + curr.unregistered,
    }),
    {
      advertisingName: '합계',
      click: 0,
      install: 0,
      registration: 0,
      retention: 0,
      purchase: 0,
      revenue: 0,
      etc1: 0,
      etc2: 0,
      etc3: 0,
      etc4: 0,
      etc5: 0,
      unregistered: 0,
    },
  )
}

const fetchData = async (baseDate: string) => {
  const { data } = await axios.get('http://localhost:3002/dashboard', {
    params: { baseDate },
    withCredentials: true,
  })
  const rows: AdvertisingStatistic[] = data.data
  const summary = calcSummary(rows)
  advertisingStatistic.value = [...rows, summary]
}

onMounted(() => {
  fetchData(selectedDate.value.toISOString().slice(0, 10))
})

watch(selectedDate, (newVal) => {
  if (newVal) fetchData(newVal.toISOString().slice(0, 10))
})
</script>

<template>
  <DefaultLayout>
    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center">
      <DatePicker v-model="selectedDate" inputId="baseDate" dateFormat="yy-mm-dd" showIcon />
    </div>

    <DataTable :value="advertisingStatistic">
      <Column field="advertisingName" header="광고명" />
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
