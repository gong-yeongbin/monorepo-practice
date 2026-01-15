<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useTrackerListStore } from '@/stores/trackerListStore'

const trackerListStore = useTrackerListStore()

const trackerList = computed(() => trackerListStore.trackerList ?? [])

onMounted(async () => {
  await trackerListStore.fetchAll()
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
