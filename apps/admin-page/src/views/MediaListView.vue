<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useMediaListStore } from '@/stores/mediaListStore.ts'

const mediaListStore = useMediaListStore()

interface Media {
  id: number
  name: string
  installPostbackUrl: string
  eventPostbackUrl: string
}

const mediaList = ref<Media[]>([])

onMounted(async () => {
  mediaList.value = await mediaListStore.get()
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
