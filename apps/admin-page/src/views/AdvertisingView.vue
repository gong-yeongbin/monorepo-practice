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
  campaign: number
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
      <Column header="">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <img :src="data.image" alt="" style="width: 32px; height: 32px" />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="campaign" header="운영캠페인" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped></style>
