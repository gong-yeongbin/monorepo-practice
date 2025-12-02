<script setup lang="ts">
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'

interface Tracker {
  name: string
  trackingUrl: string
  installPostbackUrl: string
  eventPostbackUrl: string
}

const trackerList = ref<Tracker[]>([])

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3002/tracker', {
      withCredentials: true,
    })
    trackerList.value = data.data
  } catch (error) {
    // TODO: 에러 처리 (토스트, 알럿 등)
    console.error(error)
  }
})
</script>

<template>
  <DefaultLayout>
    <DataTable :value="trackerList">
      <Column field="name" header="이름" />
      <Column field="trackingUrl" header="트래킹URL" />
      <Column field="installPostbackUrl" header="인스톨포스트백URL" />
      <Column field="eventPostbackUrl" header="이벤트포스트백URL" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped></style>
