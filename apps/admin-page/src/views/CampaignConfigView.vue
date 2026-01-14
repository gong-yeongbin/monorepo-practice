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
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'

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

// 어드민 적용 항목 선택 옵션
const adminEventOptions = [
  { label: 'install', value: 'install' },
  { label: 'retention', value: 'retention' },
  { label: 'purchase', value: 'purchase' },
  { label: 'revenue', value: 'revenue' },
  { label: 'registration', value: 'registration' },
  { label: 'etc1', value: 'etc1' },
  { label: 'etc2', value: 'etc2' },
  { label: 'etc3', value: 'etc3' },
  { label: 'etc4', value: 'etc4' },
  { label: 'etc5', value: 'etc5' },
]

// 편집 모드 상태
const isEditMode = ref(false)

// 편집 중인 configs 데이터 (로컬 복사본)
const editingConfigs = ref<
  Array<{
    campaignId: number
    sendMedia: boolean
    trackerEventName: string
    adminEventName: string
    mediaEventName: string
    isNew?: boolean
  }>
>([])

// URL 팝업 관련 상태
const showUrlDialog = ref(false)
const dialogTitle = ref('')
const dialogUrl = ref('')

// URL 팝업 열기
const openUrlDialog = (title: string, url: string) => {
  dialogTitle.value = title
  dialogUrl.value = url || '-'
  showUrlDialog.value = true
}

// URL 팝업 닫기
const closeUrlDialog = () => {
  showUrlDialog.value = false
  dialogUrl.value = ''
  dialogTitle.value = ''
}

// 텍스트 복사 함수
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: 복사 성공 메시지 표시 (Toast 등)
    console.log('복사되었습니다:', text)
  } catch (error) {
    console.error('복사 실패:', error)
    // TODO: 복사 실패 메시지 표시
  }
}

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

// 편집 모드 시작
const startEdit = () => {
  isEditMode.value = true
  // 현재 configs를 복사하여 편집 데이터로 설정
  editingConfigs.value = configs.value.map((config) => ({
    ...config,
  }))
}

// 편집 모드 취소
const cancelEdit = () => {
  isEditMode.value = false
  editingConfigs.value = []
}

// 새 행 추가
const addRow = () => {
  editingConfigs.value.push({
    campaignId: campaignId.value,
    sendMedia: true,
    trackerEventName: '',
    adminEventName: '',
    mediaEventName: '',
    isNew: true,
  })
}

// 행 삭제
const removeRow = (index: number) => {
  editingConfigs.value.splice(index, 1)
}

// 저장
const saveChanges = async () => {
  try {
    // editingConfigs에서 mutation에 필요한 필드만 추출
    const input = editingConfigs.value.map((config) => ({
      sendMedia: config.sendMedia,
      trackerEventName: config.trackerEventName,
      adminEventName: config.adminEventName,
      mediaEventName: config.mediaEventName,
    }))

    // campaignStore의 upsertCampaignConfig 호출
    await campaignStore.upsertCampaignConfig(campaignId.value, input)

    // 편집 모드 종료
    isEditMode.value = false
    editingConfigs.value = []

    // TODO: 성공 메시지 표시
  } catch (error) {
    console.error('Failed to save configs:', error)
    // TODO: 에러 메시지 표시
  }
}

onMounted(() => {
  // 기존 데이터가 없거나 필요한 경우에만 로드
  if (needsDataLoad.value) {
    loadData()
  }
})

// 관리 버튼 클릭
const handleManage = () => {
  if (isEditMode.value) {
    // 편집 모드일 때는 저장
    saveChanges()
  } else {
    // 일반 모드일 때는 편집 시작
    startEdit()
  }
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
              <Button
                label="트래커 트래킹 URL"
                icon="pi pi-external-link"
                iconPos="right"
                class="p-button-text p-button-sm url-label-button"
                @click="openUrlDialog('트래커 트래킹 URL', campaign?.trackerTrackingUrl || '')"
              />
            </div>

            <div class="ad-detail__row">
              <Button
                label="MECROSS 트래킹 URL"
                icon="pi pi-external-link"
                iconPos="right"
                class="p-button-text p-button-sm url-label-button"
                @click="openUrlDialog('MECROSS 트래킹 URL', campaign?.trackerTrackingUrl || '')"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 하단: 이벤트 설정 테이블 -->
    <section class="config-table-section">
      <div class="config-table-header">
        <h2 class="config-table-title">이벤트 설정</h2>
        <div class="config-table-actions">
          <Button
            v-if="isEditMode"
            label="취소"
            icon="pi pi-times"
            class="p-button-secondary config-table-btn"
            @click="cancelEdit"
          />
          <Button
            v-if="isEditMode"
            label="행 추가"
            icon="pi pi-plus"
            class="p-button-success config-table-btn"
            @click="addRow"
          />
          <Button
            :label="isEditMode ? '저장' : '관리'"
            :icon="isEditMode ? 'pi pi-check' : 'pi pi-cog'"
            class="config-table-manage-btn"
            @click="handleManage"
          />
        </div>
      </div>

      <DataTable :value="isEditMode ? editingConfigs : configs" class="config-table">
        <Column header="트래커 수신 이벤트 값">
          <template #body="{ data, index }">
            <InputText
              v-if="isEditMode"
              v-model="editingConfigs[index]!.trackerEventName"
              class="config-input"
              placeholder="이벤트 값 입력"
            />
            <span v-else>{{ data.trackerEventName || '-' }}</span>
          </template>
        </Column>

        <Column header="어드민 적용 항목">
          <template #body="{ data, index }">
            <Dropdown
              v-if="isEditMode"
              v-model="editingConfigs[index]!.adminEventName"
              :options="adminEventOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="선택"
              class="config-input"
            />
            <span v-else>{{ data.adminEventName || '-' }}</span>
          </template>
        </Column>

        <Column header="매체 전송 이벤트 값">
          <template #body="{ data, index }">
            <InputText
              v-if="isEditMode"
              v-model="editingConfigs[index]!.mediaEventName"
              class="config-input"
              placeholder="이벤트 값 입력"
            />
            <span v-else>{{ data.mediaEventName || '-' }}</span>
          </template>
        </Column>

        <Column header="매체 수신">
          <template #body="{ data, index }">
            <div v-if="isEditMode" class="config-edit-actions">
              <InputSwitch v-model="editingConfigs[index]!.sendMedia" />
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger config-delete-btn"
                @click="removeRow(index)"
              />
            </div>
            <label v-else class="switch">
              <input type="checkbox" :checked="data.sendMedia" disabled />
              <span class="slider" />
            </label>
          </template>
        </Column>
      </DataTable>
    </section>

    <!-- URL 팝업 Dialog -->
    <Dialog
      v-model:visible="showUrlDialog"
      :header="dialogTitle"
      modal
      :style="{ width: '500px' }"
      @hide="closeUrlDialog"
    >
      <div class="url-dialog-content">
        <div class="url-display">{{ dialogUrl }}</div>
        <div class="url-dialog-actions">
          <Button label="복사" icon="pi pi-copy" @click="copyToClipboard(dialogUrl)" />
          <Button
            label="닫기"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="closeUrlDialog"
          />
        </div>
      </div>
    </Dialog>
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
  display: flex;
  align-items: center;
}

.ad-detail__label {
  font-weight: 500;
}

.ad-detail__value {
  margin-left: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.url-button {
  padding: 2px 4px;
  min-width: auto;
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

.config-table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.config-table-btn {
  padding: 8px 16px;
}

.config-table-manage-btn {
  padding: 8px 16px;
}

.config-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.config-input {
  width: 100%;
}

.config-edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-delete-btn {
  padding: 4px;
}

.config-icon--active {
  color: #1e90ff;
  font-size: 18px;
}

.config-icon--inactive {
  color: #ccc;
  font-size: 18px;
}

/* URL Dialog 스타일 */
.url-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.url-display {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  word-break: break-all;
  font-size: 14px;
  color: #333;
  min-height: 60px;
}

.url-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

.url-label-button {
  padding: 0;
  font-weight: 500;
  color: #555;
  font-size: 13px;
  margin: 0;
  border: none;
  background: transparent;
  text-align: left;
  justify-content: flex-start;
  height: auto;
  line-height: normal;
  min-width: auto;
  display: inline-flex;
  align-items: center;
}

.url-label-button:hover {
  background: transparent;
}

.url-label-button :deep(.p-button-label) {
  padding: 0;
  line-height: normal;
}

.url-label-button :deep(.p-button-icon) {
  margin-right: 4px;
  margin-left: 0;
}
</style>
