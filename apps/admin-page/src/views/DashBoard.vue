<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import router from '@/router'
import axios from 'axios'

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
    })
    .catch(() => {})
})
</script>

<template>{{ advertisingStatistic }}</template>

<style scoped></style>
