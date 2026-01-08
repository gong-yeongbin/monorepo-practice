import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
import gql from 'graphql-tag'

// 타입 정의
type DailyStatistic = {
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

type Advertising = {
  id: number
  name: string
  dailyStatistic: DailyStatistic[]
}

type GetDashboardResult = {
  advertisings: Advertising[]
}

type Dashboard = {
  id: number
  name: string
} & DailyStatistic

// GraphQL 쿼리
const GET_DASHBOARD = gql`
  query dashboard($baseDate: DateTime!) {
    advertisings {
      id
      name
      dailyStatistic(baseDate: $baseDate) {
        click
        install
        registration
        retention
        purchase
        revenue
        etc1
        etc2
        etc3
        etc4
        etc5
        unregistered
      }
    }
  }
`

// DailyStatistic 필드 목록
const STATISTIC_FIELDS = [
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
] as const satisfies readonly (keyof DailyStatistic)[]

// 초기값 생성 함수
const createEmptyStatistic = (): DailyStatistic =>
  STATISTIC_FIELDS.reduce((acc, field) => ({ ...acc, [field]: 0 }), {} as DailyStatistic)

// 일일 통계 배열을 합산하는 함수
const sumDailyStatistics = (statistics: DailyStatistic[]): DailyStatistic =>
  statistics.reduce((acc, curr) => {
    const summed = { ...acc }
    STATISTIC_FIELDS.forEach((field) => {
      summed[field] = acc[field] + curr[field]
    })
    return summed
  }, createEmptyStatistic())

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboards: null as Dashboard[] | null,
  }),
  getters: {
    // 데이터가 존재하는지 확인
    hasData: (state) => state.dashboards !== null && state.dashboards.length > 0,
    // 특정 광고 조회
    getDashboard: (state) => (id: number) =>
      state.dashboards?.find((dashboard) => dashboard.id === id),
  },
  actions: {
    async update(baseDate: string): Promise<Dashboard[]> {
      const { data } = await apolloClient.query<GetDashboardResult>({
        query: GET_DASHBOARD,
        variables: { baseDate },
      })

      const dashboards: Dashboard[] = data.advertisings.map((advertising) => {
        const sum = sumDailyStatistics(advertising.dailyStatistic)
        return {
          id: advertising.id,
          name: advertising.name,
          ...sum,
        }
      })

      // state 업데이트
      this.dashboards = dashboards

      return dashboards
    },
    // state 초기화
    clear() {
      this.dashboards = null
    },
  },
})
