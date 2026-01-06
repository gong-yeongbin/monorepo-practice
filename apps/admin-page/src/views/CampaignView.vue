<script setup lang="ts">
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useCampaignStore } from '@/stores/campaignStore.ts'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

interface Advertising {
  id: number
  image: string
  name: string
  tracker: string
  advertiser: string
  media: string[]
  campaign: Campaign[]
}
interface Campaign {
  id: number
  name: string
  token: string
  media: string
  dailyStatistic: DailyStatistic
}
interface DailyStatistic {
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

const route = useRoute()
const campaignStore = useCampaignStore()
const advertising = ref<Advertising>()

const id = Array.isArray(route.params) ? route.params[0].id : route.params.id
const startDate = ref<Date>(new Date())
const endDate = ref<Date>(new Date())

onMounted(async () => {
  advertising.value = await campaignStore.update(
    parseInt(id),
    dayjs(startDate.value).format('YYYY-MM-DD'),
    dayjs(endDate.value).format('YYYY-MM-DD'),
  )
})

watch(startDate, async (newVal) => {
  if (newVal) {
    advertising.value = await campaignStore.update(
      parseInt(id),
      dayjs(newVal).format('YYYY-MM-DD'),
      dayjs(endDate.value).format('YYYY-MM-DD'),
    )
  }
})

watch(endDate, async (newVal) => {
  if (newVal) {
    advertising.value = await campaignStore.update(
      parseInt(id),
      dayjs(startDate.value).format('YYYY-MM-DD'),
      dayjs(newVal).format('YYYY-MM-DD'),
    )
  }
})
</script>

<template>
  <DefaultLayout>
    <section class="ad-detail">
      <div class="ad-detail__left">
        <img :src="advertising?.image" alt="ad thumbnail" class="ad-detail__thumb" />
      </div>

      <div class="ad-detail__right">
        <h2 class="ad-detail__title">
          {{ advertising?.name }}
        </h2>

        <div class="ad-detail__row">
          <span class="ad-detail__label">광고주: </span>
          <span class="ad-detail__value">{{ advertising?.name }}</span>
        </div>

        <div class="ad-detail__row">
          <span class="ad-detail__label">트래킹 솔루션: </span>
          <span class="ad-detail__value">{{ advertising?.tracker }}</span>
        </div>

        <div class="ad-detail__row">
          <span class="ad-detail__label"> 매체사({{ advertising?.media.length }}): </span>
          <span class="ad-detail__value">
            {{ advertising?.media?.join(', ') }}
          </span>
        </div>
      </div>
    </section>
    <section>
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center">
        <DatePicker v-model="startDate" dateFormat="yy-mm-dd" showIcon />
        <DatePicker v-model="endDate" dateFormat="yy-mm-dd" showIcon />
      </div>
      <DataTable :value="advertising?.campaign">
        <Column field="name" header="캠페인" style="min-width: 5px; white-space: nowrap" />
        <Column field="media" header="매체" />
        <Column field="type" header="type" />
        <Column header="click">
          <template #body="{ data }">
            {{ data.dailyStatistic?.click ?? 0 }}
          </template>
        </Column>
        <Column header="install">
          <template #body="{ data }">
            {{ data.dailyStatistic?.install ?? 0 }}
          </template>
        </Column>
        <Column header="registration">
          <template #body="{ data }">
            {{ data.dailyStatistic?.registration ?? 0 }}
          </template>
        </Column>
        <Column header="retention">
          <template #body="{ data }">
            {{ data.dailyStatistic?.retention ?? 0 }}
          </template>
        </Column>
        <Column header="purchase">
          <template #body="{ data }">
            {{ data.dailyStatistic?.purchase ?? 0 }}
          </template>
        </Column>
        <Column header="revenue">
          <template #body="{ data }">
            {{ data.dailyStatistic?.revenue ?? 0 }}
          </template>
        </Column>
        <Column header="etc1">
          <template #body="{ data }">
            {{ data.dailyStatistic?.etc1 ?? 0 }}
          </template>
        </Column>
        <Column header="etc2">
          <template #body="{ data }">
            {{ data.dailyStatistic?.etc2 ?? 0 }}
          </template>
        </Column>
        <Column header="etc3">
          <template #body="{ data }">
            {{ data.dailyStatistic?.etc3 ?? 0 }}
          </template>
        </Column>
        <Column header="etc4">
          <template #body="{ data }">
            {{ data.dailyStatistic?.etc4 ?? 0 }}
          </template>
        </Column>
        <Column header="etc5">
          <template #body="{ data }">
            {{ data.dailyStatistic?.etc5 ?? 0 }}
          </template>
        </Column>
        <Column header="unregistered">
          <template #body="{ data }">
            {{ data.dailyStatistic?.unregistered ?? 0 }}
          </template>
        </Column>
        <Column header="상태" style="min-width: 5px; white-space: nowrap">
          <template #body="{ data }">
            {{ data.dailyStatistic?.isActive ?? true }}
          </template>
        </Column>
      </DataTable>
    </section>
  </DefaultLayout>
</template>

<style scoped>
.ad-detail {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.ad-detail__thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}
.ad-detail__title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}
.ad-detail__row {
  font-size: 13px;
  color: #555;
}
.ad-detail__label {
  font-weight: 500;
  margin-right: 4px;
}
</style>
