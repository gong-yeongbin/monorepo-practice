<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Advertising {
  image: string
  name: string
  trackerName: string
}

const AdvertisingList = ref<Advertising[]>([])

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3002/advertising', {
      withCredentials: true,
    })
    AdvertisingList.value = data.data
  } catch (error) {
    // TODO: 에러 처리 (토스트, 알럿 등)
    console.error(error)
  }
})
</script>

<template>
  <DefaultLayout>
    <DataTable :value="AdvertisingList">
      <Column field="image" />
      <Column field="name" header="광고명" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped></style>
