<script setup lang="ts">
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import axios from 'axios'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Seoul')

interface CampaignDateStatistic {
  token: string
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
  createdDate: Date
}

const startDate = ref<Date>(new Date())
const endDate = ref<Date>(new Date())
const campaignDateStatistic = ref<CampaignDateStatistic[]>([])
const props = defineProps<{
  token: string | string[] | undefined
}>()

const fetchData = async (startDate: string, endDate: string) => {
  const { data } = await axios.get(`http://localhost:3002/dashboard/campaign/${props.token}`, {
    params: { startDate, endDate },
    withCredentials: true,
  })

  campaignDateStatistic.value = data.data
}

onMounted(() => {
  fetchData(dayjs(startDate.value).format('YYYY-MM-DD'), dayjs(endDate.value).format('YYYY-MM-DD'))
})

watch(startDate, (newVal) => {
  if (newVal)
    fetchData(dayjs(newVal).format('YYYY-MM-DD'), dayjs(endDate.value).format('YYYY-MM-DD'))
})

watch(endDate, (newVal) => {
  if (newVal)
    fetchData(dayjs(startDate.value).format('YYYY-MM-DD'), dayjs(newVal).format('YYYY-MM-DD'))
})
</script>

<template>
  <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center">
    <DatePicker v-model="startDate" dateFormat="yy-mm-dd" showIcon />
    <DatePicker v-model="endDate" dateFormat="yy-mm-dd" showIcon />
    <DataTable :value="campaignDateStatistic">
      <Column field="token" header="토큰" :hidden="true" />
      <Column field="createdDate" header="date" />
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
  </div>
</template>

<style scoped></style>
