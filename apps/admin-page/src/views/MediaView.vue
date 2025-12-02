<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Media {
  name: string
  installPostbackUrl: string
  eventPostbackUrl: string
}

const mediaList = ref<Media[]>([])

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3002/media', {
      withCredentials: true,
    })
    mediaList.value = data.data
  } catch (error) {
    // TODO: 에러 처리 (토스트, 알럿 등)
    console.error(error)
  }
})
</script>

<template>
  <DefaultLayout>
    <DataTable :value="mediaList">
      <Column field="name" header="이름" />
      <Column field="installPostbackUrl" header="인스톨포스트백URL" />
      <Column field="eventPostbackUrl" header="이벤트포스트백URL" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped></style>
