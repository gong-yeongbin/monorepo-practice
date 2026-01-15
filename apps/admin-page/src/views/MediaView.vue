<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import dayjs from 'dayjs'
import { useCampaignStore } from '@/stores/campaignStore'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
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
}

// 라우트 파라미터 추출 헬퍼
const extractRouteParam = (
  param: string | string[] | undefined,
  defaultValue: string = '',
): string => {
  if (Array.isArray(param)) {
    return param[0] || defaultValue
  }
  return (param as string) || defaultValue
}

const extractQueryParamAsInt = (
  param: string | string[] | undefined,
  defaultValue: number = 0,
): number => {
  const value = extractRouteParam(param)
  return parseInt(value, 10) || defaultValue
}

// 라우트에서 파라미터 추출
const advertisingId = computed(() =>
  extractQueryParamAsInt(route.query.advertisingId as string | string[] | undefined),
)
const token = computed(() => extractRouteParam(route.params.token))

// 날짜 초기값 설정 (쿼리에서 가져오거나 현재 날짜)
const getInitialDate = () => {
  const baseDate = route.query.baseDate as string
  return baseDate ? new Date(baseDate) : new Date()
}

const baseDateValue = getInitialDate()
const startDate = ref<Date>(dayjs(baseDateValue).subtract(7, 'day').toDate())
const endDate = ref<Date>(baseDateValue)

// store의 advertising 데이터 접근
const advertising = computed(() => campaignStore.advertising)
const campaign = computed(() => {
  if (!token.value || !advertising.value) {
    return undefined
  }
  return campaignStore.getCampaign(token.value)
})

// 날짜별 통계 데이터
const dailyStatistics = ref<DailyStatisticWithDate[]>([])

// 날짜 포맷팅 헬퍼
const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')
const formatDisplayDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

// 날짜를 키로 사용하여 같은 날짜의 데이터를 합치는 함수
const mergeDailyStatistics = (statistics: DailyStatisticWithDate[]): DailyStatisticWithDate[] => {
  const mergedMap = new Map<string, DailyStatisticWithDate>()

  statistics.forEach((stat) => {
    const dateKey = formatDisplayDate(stat.createdDate)

    if (mergedMap.has(dateKey)) {
      const existing = mergedMap.get(dateKey)!
      // 같은 날짜의 데이터를 합산
      mergedMap.set(dateKey, {
        click: existing.click + stat.click,
        install: existing.install + stat.install,
        registration: existing.registration + stat.registration,
        retention: existing.retention + stat.retention,
        purchase: existing.purchase + stat.purchase,
        revenue: existing.revenue + stat.revenue,
        etc1: existing.etc1 + stat.etc1,
        etc2: existing.etc2 + stat.etc2,
        etc3: existing.etc3 + stat.etc3,
        etc4: existing.etc4 + stat.etc4,
        etc5: existing.etc5 + stat.etc5,
        unregistered: existing.unregistered + stat.unregistered,
        createdDate: existing.createdDate, // 첫 번째 날짜 사용
      })
    } else {
      mergedMap.set(dateKey, { ...stat })
    }
  })

  // 날짜순으로 정렬하여 반환
  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
  )
}

// 상세 페이지로 이동 (클릭한 row의 날짜 전송)
const handleDetailClick = (rowData: DailyStatisticWithDate) => {
  // 클릭한 row의 날짜를 포맷팅하여 전송
  const selectedDate = formatDisplayDate(rowData.createdDate)

  router.push({
    name: 'mediaDetail',
    params: {
      token: token.value,
    },
    query: {
      advertisingId: advertisingId.value,
      baseDate: selectedDate,
    },
  })
}

// 데이터 로드 함수
const loadCampaignData = async () => {
  if (!advertisingId.value || !token.value || !startDate.value || !endDate.value) {
    return
  }

  try {
    // 캠페인 기본 정보 및 통계 데이터 가져오기
    await campaignStore.getCampaignByToken(
      token.value,
      advertisingId.value,
      formatDate(startDate.value),
      formatDate(endDate.value),
    )

    // 날짜별 통계 데이터 가져오기 (store에서)
    const rawStats = campaignStore.getDailyStatisticsByToken(
      token.value,
      advertisingId.value,
      formatDate(startDate.value),
      formatDate(endDate.value),
    )

    if (rawStats && rawStats.length > 0) {
      // 타입 변환 및 같은 날짜의 데이터 합치기
      const statsWithDate: DailyStatisticWithDate[] = rawStats.map((stat) => ({
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
      }))

      dailyStatistics.value = mergeDailyStatistics(statsWithDate)
    } else {
      dailyStatistics.value = []
    }
  } catch (error) {
    console.error('Failed to load campaign data:', error)
    dailyStatistics.value = []
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

        <!-- 통계 필드를 반복하여 렌더링 -->
        <Column v-for="field in statisticFields" :key="field" :header="field">
          <template #body="{ data }">
            {{ data[field] ?? 0 }}
          </template>
        </Column>

        <Column header="">
          <template #body="{ data }">
            <Button
              label="상세"
              icon="pi pi-external-link"
              class="p-button-sm p-button-text"
              @click="handleDetailClick(data)"
            />
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
