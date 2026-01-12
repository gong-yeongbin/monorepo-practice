<script setup lang="ts">
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useCampaignStore } from '@/stores/campaignStore.ts'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const route = useRoute()
const campaignStore = useCampaignStore()

// store의 state를 computed로 직접 접근
const advertising = computed(() => campaignStore.advertising)

// 라우트 파라미터에서 id 추출
const advertisingId = computed(() => {
  const advertisingId = route.query.advertisingId as string
  return parseInt((advertisingId as string) || '0', 10)
})

// 날짜 초기값 설정 (쿼리에서 가져오거나 현재 날짜)
const getInitialDate = () => {
  const baseDate = route.query.baseDate as string
  return baseDate ? new Date(baseDate) : new Date()
}

const baseDateValue = getInitialDate()
const startDate = ref<Date>(baseDateValue)
const endDate = ref<Date>(baseDateValue)

// 날짜 포맷팅 헬퍼
const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')

// 데이터 로드 함수
const loadData = async () => {
  if (advertisingId.value && startDate.value && endDate.value) {
    try {
      await campaignStore.update(
        advertisingId.value,
        formatDate(startDate.value),
        formatDate(endDate.value),
      )
    } catch (error) {
      console.error('Failed to load campaign data:', error)
    }
  }
}

onMounted(() => {
  loadData()
})

// startDate, endDate 변경 시 자동으로 데이터 갱신
watch([startDate, endDate], async () => {
  if (startDate.value && endDate.value) {
    await loadData()
  }
})

// 통계 필드 정의 (컬럼 렌더링용)
const statisticFields = [
  { key: 'click', header: 'click' },
  { key: 'install', header: 'install' },
  { key: 'registration', header: 'registration' },
  { key: 'retention', header: 'retention' },
  { key: 'purchase', header: 'purchase' },
  { key: 'revenue', header: 'revenue' },
  { key: 'etc1', header: 'etc1' },
  { key: 'etc2', header: 'etc2' },
  { key: 'etc3', header: 'etc3' },
  { key: 'etc4', header: 'etc4' },
  { key: 'etc5', header: 'etc5' },
  { key: 'unregistered', header: 'unregistered' },
] as const
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
          <span class="ad-detail__value">{{ advertising?.advertiser }}</span>
        </div>

        <div class="ad-detail__row">
          <span class="ad-detail__label">트래킹 솔루션: </span>
          <span class="ad-detail__value">{{ advertising?.tracker }}</span>
        </div>

        <div class="ad-detail__row">
          <span class="ad-detail__label">매체사({{ advertising?.media?.length ?? 0 }}): </span>
          <span class="ad-detail__value">
            {{ advertising?.media?.join(', ') }}
          </span>
        </div>
      </div>
    </section>

    <section>
      <div class="date-picker-container">
        <DatePicker v-model="startDate" dateFormat="yy-mm-dd" showIcon />
        <DatePicker v-model="endDate" dateFormat="yy-mm-dd" showIcon />
      </div>

      <DataTable :value="advertising?.campaign">
        <Column field="name" header="캠페인" style="min-width: 5px; white-space: nowrap">
          <template #body="{ data }">
            <router-link
              :to="{
                name: 'media',
                params: { token: data.token },
                query: { advertisingId, baseDate: formatDate(endDate) },
              }"
            >
              {{ data.name }}
            </router-link>
          </template>
        </Column>

        <Column field="media" header="매체" />
        <Column field="type" header="type" />

        <!-- 통계 필드를 반복하여 렌더링 -->
        <Column v-for="field in statisticFields" :key="field.key" :header="field.header">
          <template #body="{ data }">
            {{ data.dailyStatistic?.[field.key] ?? 0 }}
          </template>
        </Column>

        <Column header="상태" style="min-width: 5px; white-space: nowrap">
          <template #body="{ data }">
            {{ data.isActive !== undefined ? (data.isActive ? '활성' : '비활성') : '-' }}
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

.date-picker-container {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
