<template>
  <div class="page">
    <!-- 상단 앱 정보 -->
    <header class="app-header">
      <div class="app-icon">
        <!-- 실제로는 <img :src="app.icon" /> 로 교체 -->
        <div class="icon-placeholder">🐰</div>
      </div>
      <div class="app-info">
        <h1 class="app-title">{{ app.name }}</h1>
        <div class="app-meta-row">
          <span class="label">광고주</span>
          <span class="value">| {{ app.advertiser }}</span>
        </div>
        <div class="app-meta-row">
          <span class="label">트래킹 솔루션</span>
          <span class="value">| {{ app.trackingSolution }}</span>
        </div>
        <div class="app-meta-row">
          <span class="label">매체사</span>
          <span class="value">| {{ app.mediaPartner }}</span>
        </div>
      </div>

      <button class="campaign-add-btn" type="button" @click="onAddCampaign">+ 캠페인 등록</button>
    </header>

    <!-- 테이블 -->
    <section class="campaign-table">
      <table>
        <thead>
          <tr>
            <th>매체</th>
            <th>타입</th>
            <th>캠페인명</th>
            <th>예약 변경</th>
            <th>BLOCK</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in campaigns" :key="row.id">
            <td>{{ row.media }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.name }}</td>
            <td>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="row.reservation"
                  @change="onToggleReservation(row)"
                />
                <span class="slider" />
              </label>
            </td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="row.block" @change="onToggleBlock(row)" />
                <span class="slider" />
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const app = reactive({
  name: 'Fruity Match Mayhem (AOS)',
  advertiser: 'ad',
  trackingSolution: 'singular',
  mediaPartner: 'admile',
})

interface CampaignRow {
  id: number
  media: string
  type: string
  name: string
  reservation: boolean
  block: boolean
}

const campaigns = reactive<CampaignRow[]>([
  {
    id: 1,
    media: 'admile',
    type: 'CPA',
    name: '리워드',
    reservation: true,
    block: false,
  },
])

function onAddCampaign() {
  // 실제로는 모달 오픈 / 라우팅 등
  alert('캠페인 등록 버튼 클릭')
}

function onToggleReservation(row: CampaignRow) {
  console.log('예약 변경 토글', row.id, row.reservation)
}

function onToggleBlock(row: CampaignRow) {
  console.log('BLOCK 토글', row.id, row.block)
}
</script>

<style scoped>
.page {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  padding: 24px;
}

/* 상단 영역 */
.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.app-icon .icon-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f3f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.app-info {
  flex: 1;
}

.app-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.app-meta-row {
  font-size: 13px;
  color: #555;
}

.app-meta-row .label {
  font-weight: 500;
}

.campaign-add-btn {
  margin-left: auto;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}

/* 테이블 */
.campaign-table {
  padding: 16px 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 10px 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

th {
  font-weight: 600;
  color: #555;
}

/* 토글 스위치 (간단 버전) */
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
