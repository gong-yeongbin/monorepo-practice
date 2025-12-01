<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import router from '@/router'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const userStore = useUserStore()
if (!userStore.isLogin) router.push('/login')

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

const today = new Date().toISOString().slice(0, 10)
const advertisingStatistic = ref<AdvertisingStatistic[]>([])

onMounted(async () => {
  axios
    .get('http://localhost:3002/dashboard', {
      params: { baseDate: today },
      withCredentials: true,
    })
    .then((response) => {
      advertisingStatistic.value = response.data.data
      const sum = advertisingStatistic.value.reduce(
        (acc, curr) => {
          acc.click += curr.click
          acc.install += curr.install
          acc.registration += curr.registration
          acc.retention += curr.retention
          acc.purchase += curr.purchase
          acc.revenue += curr.revenue
          acc.etc1 += curr.etc1
          acc.etc2 += curr.etc2
          acc.etc3 += curr.etc3
          acc.etc4 += curr.etc4
          acc.etc5 += curr.etc5
          acc.unregistered += curr.unregistered
          return acc
        },
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
      advertisingStatistic.value.push(sum)
    })
    .catch(() => {})
})
</script>

<template>
  <DefaultLayout>
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
