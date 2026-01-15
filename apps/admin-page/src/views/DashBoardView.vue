<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DataTable from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useDashboardStore } from '@/stores/dashboardStore'

// dayjs 플러그인 설정 (한 번만 실행)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Seoul')

const dashboardStore = useDashboardStore()

// store의 state를 computed로 직접 접근
const dashboards = computed(() => dashboardStore.dashboards ?? [])

const selectedDate = ref<Date>(new Date())

// 날짜 포맷팅 헬퍼
const formatDate = (date: Date) => dayjs(date).tz('Asia/Seoul').format('YYYY-MM-DD')

// 데이터 로드 함수
const loadData = async () => {
  if (selectedDate.value) {
    await dashboardStore.update(formatDate(selectedDate.value))
  }
}

// selectedDate 변경 시 자동으로 데이터 갱신
watchEffect(() => {
  if (selectedDate.value) {
    loadData()
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
    <div class="date-picker-container">
      <DatePicker v-model="selectedDate" dateFormat="yy-mm-dd" showIcon />
    </div>

    <DataTable :value="dashboards">
      <Column field="name" header="광고명" class="name-column">
        <template #body="{ data }">
          <router-link
            :to="{
              name: 'campaign',
              query: { advertisingId: data.id, baseDate: formatDate(selectedDate) },
            }"
            class="campaign-link"
          >
            {{ data.name }}
          </router-link>
        </template>
      </Column>

      <!-- 통계 필드를 반복하여 렌더링 -->
      <Column v-for="field in statisticFields" :key="field" :field="field" :header="field" />
    </DataTable>
  </DefaultLayout>
</template>

<style scoped>
.date-picker-container {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.name-column {
  min-width: 5px;
  white-space: nowrap;
}

.campaign-link {
  color: #007bff;
  text-decoration: none;
}

.campaign-link:hover {
  text-decoration: underline;
}
</style>
