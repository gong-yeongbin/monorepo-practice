<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import dayjs from 'dayjs'
import { useCampaignStore } from '@/stores/campaignStore.ts'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
const campaignStore = useCampaignStore()

// 라우트 파라미터에서 id 추출
const advertisingId = computed(() => {
  const routeId = route.params.id
  if (Array.isArray(routeId)) {
    return parseInt(routeId[0] || '0', 10)
  }
  return parseInt((routeId as string) || '0', 10)
})

// store의 advertising 데이터 접근
const advertising = computed(() => campaignStore.advertising)

// 날짜 포맷팅 헬퍼
const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')

// 오늘 날짜로 초기화 (campaign 목록 조회용)
const today = new Date()
const baseDate = formatDate(today)

// 데이터 로드 함수
const loadData = async () => {
  if (advertisingId.value) {
    try {
      await campaignStore.update(advertisingId.value, baseDate, baseDate)
    } catch (error) {
      console.error('Failed to load advertising data:', error)
    }
  }
}

onMounted(() => {
  loadData()
})

// 캠페인 상세 페이지로 이동
const handleCampaignClick = (token: string) => {
  router.push({
    name: 'media',
    params: { token },
    query: {
      advertisingId: advertisingId.value.toString(),
      baseDate,
    },
  })
}

// 캠페인 등록 페이지로 이동 (추후 구현)
const onAddCampaign = () => {
  // TODO: 캠페인 등록 모달 또는 페이지로 이동
  console.log('캠페인 등록')
}

// 예약 변경 토글 (추후 mutation 구현 필요)
const onToggleReservation = (campaign: any) => {
  console.log('예약 변경 토글', campaign.id, campaign.reservation)
  // TODO: mutation 호출
}

// BLOCK 토글 (isActive 변경, 추후 mutation 구현 필요)
const onToggleBlock = (campaign: any) => {
  console.log('BLOCK 토글', campaign.id, campaign.isActive)
  // TODO: mutation 호출하여 isActive 변경
}

// 캠페인 목록 (computed)
const campaigns = computed(() => {
  return advertising.value?.campaign || []
})
</script>

<template>
  <DefaultLayout>
    <section class="ad-detail">
      <div class="ad-detail__left">
        <img :src="advertising?.image" alt="ad thumbnail" class="ad-detail__thumb" />
      </div>

      <div class="ad-detail__right">
        <h1 class="ad-detail__title">
          {{ advertising?.name }}
        </h1>

        <div class="ad-detail__row">
          <span class="ad-detail__label">광고주</span>
          <span class="ad-detail__value">| {{ advertising?.advertiser }}</span>
        </div>
        <div class="ad-detail__row">
          <span class="ad-detail__label">트래킹 솔루션</span>
          <span class="ad-detail__value">| {{ advertising?.tracker }}</span>
        </div>
        <div class="ad-detail__row">
          <span class="ad-detail__label">매체사</span>
          <span class="ad-detail__value"> | {{ advertising?.media?.join(', ') || '-' }} </span>
        </div>
      </div>
    </section>
    <section class="button-section">
      <Button label="예약변경" icon="pi pi-calendar" @click="onAddCampaign" />
      <Button label="캠페인 등록" icon="pi pi-plus" @click="onAddCampaign" />
    </section>
    <section class="campaign-table">
      <DataTable :value="campaigns">
        <Column field="media" header="매체" />
        <Column field="type" header="타입" />
        <Column field="name" header="캠페인명">
          <template #body="{ data }">
            <a href="#" @click.prevent="handleCampaignClick(data.token)" class="campaign-link">
              {{ data.name }}
            </a>
          </template>
        </Column>
        <Column header="상태">
          <template #body="{ data }">
            <label class="switch">
              <input type="checkbox" :checked="data.isActive" @change="onToggleBlock(data)" />
              <span class="slider" />
            </label>
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
  padding: 16px 24px;
  margin-bottom: 24px;
}

.ad-detail__thumb {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  background: #f3f3f3;
}

.ad-detail__right {
  flex: 1;
}

.ad-detail__title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.ad-detail__row {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
}

.ad-detail__label {
  font-weight: 500;
}

.ad-detail__value {
  margin-left: 4px;
}

.button-section {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px;
  margin-bottom: 16px;
}

.campaign-table {
  padding: 0 24px;
}

.campaign-link {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}

.campaign-link:hover {
  text-decoration: underline;
}

/* 토글 스위치 */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  border-radius: 999px;
  transition: 0.2s;
}

.slider::before {
  content: '';
  position: absolute;
  height: 14px;
  width: 14px;
  left: 2px;
  top: 2px;
  background-color: #fff;
  border-radius: 50%;
  transition: 0.2s;
}

.switch input:checked + .slider {
  background-color: #1e90ff;
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
}
</style>
