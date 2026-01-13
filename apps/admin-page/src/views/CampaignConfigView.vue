<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useCampaignStore } from '@/stores/campaignStore.ts'
import dayjs from 'dayjs'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputSwitch from 'primevue/inputswitch'

const route = useRoute()
const router = useRouter()
const campaignStore = useCampaignStore()

// 라우트 파라미터에서 campaignId 추출
const campaignId = computed(() => {
  const routeId = route.params.id
  if (Array.isArray(routeId)) {
    return parseInt(routeId[0] || '0', 10)
  }
  return parseInt((routeId as string) || '0', 10)
})

// query에서 advertisingId 가져오기
const advertisingId = computed(() => {
  const id = route.query.advertisingId as string
  return parseInt(id || '0', 10)
})

// campaign 정보
const campaign = computed(() => {
  if (!campaignStore.advertising) {
    return null
  }
  return campaignStore.advertising.campaign.find((cp) => cp.id === campaignId.value)
})

// config 정보 - getCampaignConfigById 사용
const configs = computed(() => {
  const config = campaignStore.getCampaignConfigById(campaignId.value)
  return config || []
})

// advertising 정보
const advertising = computed(() => campaignStore.advertising)

// 데이터가 필요한지 확인 (기존 데이터가 없거나 다른 advertisingId인 경우)
const needsDataLoad = computed(() => {
  return (
    !campaignStore.advertising ||
    campaignStore.currentAdvertisingId !== advertisingId.value ||
    !campaign.value
  )
})

// 데이터 로드 함수 (필요한 경우에만)
const loadData = async () => {
  if (needsDataLoad.value && advertisingId.value) {
    try {
      const today = new Date()
      const baseDate = dayjs(today).format('YYYY-MM-DD')
      await campaignStore.update(advertisingId.value, baseDate, baseDate)
    } catch (error) {
      console.error('Failed to load campaign config data:', error)
    }
  }
}

// BLOCK 토글 (isActive 변경, 추후 mutation 구현 필요)
const onToggleBlock = (campaign: any) => {
  console.log('BLOCK 토글', campaign.id, campaign.isActive)
  // TODO: mutation 호출하여 isActive 변경
}

onMounted(() => {
  // 기존 데이터가 없거나 필요한 경우에만 로드
  if (needsDataLoad.value) {
    loadData()
  }
})

// 관리 버튼 클릭 (추후 구현)
const handleManage = () => {
  console.log('관리 버튼 클릭')
  // TODO: 관리 기능 구현
}
</script>

<template>
  <DefaultLayout>
    <!-- 상단: 캠페인 일반 정보 -->
    <section class="ad-detail">
      <div class="ad-detail__left">
        <img :src="advertising?.image" alt="ad thumbnail" class="ad-detail__thumb" />
      </div>

      <div class="ad-detail__right">
        <div class="ad-detail__content">
          <!-- 첫 번째 묶음: 광고주, 트래킹 솔루션, 선택 매체사 -->
          <div class="ad-detail__group">
            <h1 class="ad-detail__title">{{ advertising?.name || '-' }}</h1>

            <div class="ad-detail__row">
              <span class="ad-detail__label">캠페인</span>
              <span class="ad-detail__value">| {{ campaign?.name || '-' }}</span>
            </div>

            <div class="ad-detail__row">
              <span class="ad-detail__label">광고주</span>
              <span class="ad-detail__value">| {{ advertising?.advertiser || '-' }}</span>
            </div>

            <div class="ad-detail__row">
              <span class="ad-detail__label">트래킹 솔루션</span>
              <span class="ad-detail__value">| {{ advertising?.tracker || '-' }}</span>
            </div>

            <div class="ad-detail__row">
              <span class="ad-detail__label">선택 매체사</span>
              <span class="ad-detail__value">| {{ campaign?.media || '-' }}</span>
            </div>
          </div>

          <!-- 두 번째 묶음: 캠페인, TYPE, 상태, 트래커 트래킹 URL, MECROSS 트래킹 URL -->
          <div class="ad-detail__group">
            <div class="ad-detail__row">
              <span class="ad-detail__label">TYPE</span>
              <span class="ad-detail__value">| {{ campaign?.type || '-' }}</span>
            </div>

            <div class="ad-detail__row">
              <span class="ad-detail__label">상태</span>
              <span class="ad-detail__value">
                |
                {{
                  campaign?.isActive !== undefined ? (campaign.isActive ? '활성' : '비활성') : '-'
                }}
              </span>
            </div>

            <div class="ad-detail__row">
              <span class="ad-detail__label">트래커 트래킹 URL</span>
              <span class="ad-detail__value">| {{ campaign?.trackerTrackingUrl || '-' }}</span>
            </div>

            <div class="ad-detail__row">
              <span class="ad-detail__label">MECROSS 트래킹 URL</span>
              <span class="ad-detail__value">| {{ campaign?.trackerTrackingUrl || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 하단: 이벤트 설정 테이블 -->
    <section class="config-table-section">
      <div class="config-table-header">
        <h2 class="config-table-title">이벤트 설정</h2>
        <Button
          label="관리"
          icon="pi pi-cog"
          class="config-table-manage-btn"
          @click="handleManage"
        />
      </div>

      <DataTable :value="configs" class="config-table">
        <Column field="trackerEventName" header="트래커 수신 이벤트 값">
          <template #body="{ data }">
            <span>{{ data.trackerEventName || '-' }}</span>
          </template>
        </Column>

        <Column field="adminEventName" header="어드민 적용 항목">
          <template #body="{ data }">
            <span>{{ data.adminEventName || '-' }}</span>
          </template>
        </Column>

        <Column field="mediaEventName" header="매체 전송 이벤트 값">
          <template #body="{ data }">
            <span>{{ data.mediaEventName || '-' }}</span>
          </template>
        </Column>

        <Column header="매체 수신">
          <template #body="{ data }">
            <label class="switch">
              <input type="checkbox" :checked="data.sendMedia" @change="onToggleBlock(data)" />
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
  margin-bottom: 24px;
}

.ad-detail__thumb {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  background: #f3f3f3;
}

.ad-detail__thumb-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.ad-detail__right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ad-detail__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}

.ad-detail__content {
  display: flex;
  gap: 48px;
  align-items: flex-start;
}

.ad-detail__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.ad-detail__row {
  font-size: 13px;
  color: #555;
  white-space: nowrap;
}

.ad-detail__label {
  font-weight: 500;
}

.ad-detail__value {
  margin-left: 4px;
}

.config-table-section {
  padding: 0 24px 24px;
}

.config-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.config-table-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.config-table-manage-btn {
  padding: 8px 16px;
}

.config-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.config-icon--active {
  color: #1e90ff;
  font-size: 18px;
}

.config-icon--inactive {
  color: #ccc;
  font-size: 18px;
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
