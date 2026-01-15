<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useMediaListStore } from '@/stores/mediaListStore'

const mediaListStore = useMediaListStore()

const mediaList = computed(() => mediaListStore.mediaList ?? [])

onMounted(async () => {
  await mediaListStore.fetchAll()
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
