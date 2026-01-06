<script setup lang="ts">
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { onMounted, ref } from 'vue'
import { useTrackerListStore } from '@/stores/trackerListStore.ts'

const trackerListStore = useTrackerListStore()

interface Tracker {
  id: number
  name: string
  trackingUrl: string
  installPostbackUrl: string
  eventPostbackUrl: string
}

const trackerList = ref<Tracker[]>([])

onMounted(async () => {
  trackerList.value = await trackerListStore.get()
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
