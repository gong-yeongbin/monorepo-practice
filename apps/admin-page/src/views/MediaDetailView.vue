<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import dayjs from 'dayjs'
import { useCampaignStore } from '@/stores/campaignStore.ts'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const route = useRoute()
const campaignStore = useCampaignStore()

// 타입 정의
type DailyStatisticWithDate = {
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
  createdDate: string
  viewCode?: string
  pubId?: string | null
  subId?: string | null
}

// 라우트에서 파라미터 추출
const advertisingId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return parseInt(id[0] || '0', 10)
  }
  return parseInt((id as string) || '0', 10)
})

const token = computed(() => {
  const tokenParam = route.params.token
  if (Array.isArray(tokenParam)) {
    return tokenParam[0] || ''
  }
  return (tokenParam as string) || ''
})

// 쿼리에서 날짜 가져오기 (선택적)
const queryDate = computed(() => {
  const date = route.query.date as string
  return date ? new Date(date) : null
})

// 날짜 초기값 설정 (쿼리에서 가져오거나 현재 날짜)
const getInitialDate = () => {
  const baseDate = route.query.baseDate as string
  return baseDate ? new Date(baseDate) : new Date()
}

const baseDateValue = getInitialDate()
const startDate = ref<Date>(baseDateValue)
const endDate = ref<Date>(baseDateValue)

// store의 advertising 데이터 접근
const advertising = computed(() => campaignStore.advertising)
const campaign = ref<{ name: string; media: string; token: string } | undefined>(undefined)

// 날짜별 통계 데이터 (원본 그대로, 합치지 않음)
const dailyStatistics = ref<DailyStatisticWithDate[]>([])

// 날짜 포맷팅 헬퍼
const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')
const formatDisplayDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

// 데이터 로드 함수
const loadCampaignData = async () => {
  if (advertisingId.value && token.value && startDate.value && endDate.value) {
    // 캠페인 기본 정보 가져오기
    const campaignData = await campaignStore.getCampaignByToken(
      token.value,
      advertisingId.value,
      formatDate(startDate.value),
      formatDate(endDate.value),
    )
    if (campaignData) {
      campaign.value = campaignData
    }

    // 날짜별 통계 데이터 가져오기 (store에서)
    const rawStats = campaignStore.getDailyStatisticsByToken(
      token.value,
      advertisingId.value,
      formatDate(startDate.value),
      formatDate(endDate.value),
    )

    if (rawStats && rawStats.length > 0) {
      // 타입 변환 (합치지 않고 원본 그대로)
      let statsWithDate: DailyStatisticWithDate[] = rawStats.map((stat) => ({
        click: stat.click,
        install: stat.install,
        registration: stat.registration,
        retention: stat.retention,
        purchase: stat.purchase,
        revenue: stat.revenue,
        etc1: stat.etc1,
        etc2: stat.etc2,
        etc3: stat.etc3,
        etc4: stat.etc4,
        etc5: stat.etc5,
        unregistered: stat.unregistered,
        createdDate: stat.createdDate || '',
        viewCode: stat.viewCode,
        pubId: stat.pubId,
        subId: stat.subId,
      }))

      // 쿼리에서 특정 날짜가 있으면 해당 날짜만 필터링
      if (queryDate.value) {
        const targetDate = formatDate(queryDate.value)
        statsWithDate = statsWithDate.filter(
          (stat) => formatDisplayDate(stat.createdDate) === targetDate,
        )
      }

      // 날짜순으로 정렬
      dailyStatistics.value = statsWithDate.sort(
        (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
      )
    } else {
      dailyStatistics.value = []
    }
  }
}

onMounted(() => {
  loadCampaignData()
})

// 날짜 변경 시 자동으로 데이터 갱신
watch([startDate, endDate], async () => {
  if (startDate.value && endDate.value) {
    await loadCampaignData()
  }
})

// 통계 필드 정의 (컬럼 렌더링용)
const statisticFields = [
  'click',
  'install',
  'registration',
  'retention',
  'purchase',
  'revenue',
  'etc1',
  'etc2',
  'etc3',
  'etc4',
  'etc5',
  'unregistered',
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
          <span class="ad-detail__label">매체사: </span>
          <span class="ad-detail__value">{{ campaign?.media }}</span>
        </div>

        <div class="ad-detail__row" v-if="campaign">
          <span class="ad-detail__label">캠페인명: </span>
          <span class="ad-detail__value">{{ campaign.name }}</span>
        </div>
      </div>
    </section>

    <section>
      <div class="date-picker-container">
        <DatePicker v-model="startDate" dateFormat="yy-mm-dd" showIcon />
        <DatePicker v-model="endDate" dateFormat="yy-mm-dd" showIcon />
      </div>

      <DataTable :value="dailyStatistics">
        <Column header="날짜">
          <template #body="{ data }">
            {{ formatDisplayDate(data.createdDate) }}
          </template>
        </Column>

        <Column v-if="dailyStatistics.some((s) => s.viewCode)" header="viewCode">
          <template #body="{ data }">
            {{ data.viewCode || '-' }}
          </template>
        </Column>

        <Column v-if="dailyStatistics.some((s) => s.pubId)" header="pubId">
          <template #body="{ data }">
            {{ data.pubId || '-' }}
          </template>
        </Column>

        <Column v-if="dailyStatistics.some((s) => s.subId)" header="subId">
          <template #body="{ data }">
            {{ data.subId || '-' }}
          </template>
        </Column>

        <!-- 통계 필드를 반복하여 렌더링 -->
        <Column v-for="field in statisticFields" :key="field" :header="field">
          <template #body="{ data }">
            {{ data[field] ?? 0 }}
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
  margin-bottom: 4px;
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
