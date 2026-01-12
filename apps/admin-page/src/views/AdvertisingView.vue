<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAdvertisingStore } from '@/stores/advertisingStore'

const advertisingStore = useAdvertisingStore()

// store의 state를 computed로 직접 접근
const advertisingList = computed(() => advertisingStore.advertisings ?? [])

onMounted(async () => {
  await advertisingStore.fetchAll()
})
</script>

<template>
  <DefaultLayout>
    <DataTable :value="advertisingList">
      <Column field="name" header="광고명" class="name-column">
        <template #body="{ data }">
          <router-link
            :to="{
              name: 'campaign',
              params: { id: data.id },
            }"
            class="campaign-link"
          >
            {{ data.name }}
          </router-link>
        </template>
      </Column>
      <Column field="campaign" header="운영캠페인" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped>
.advertising-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.advertising-thumb {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.advertising-name-column {
  min-width: 200px;
}
</style>
