import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
import gql from 'graphql-tag'

// 타입 정의 통합 및 구조화
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

type Campaign = {
  id: number
  name: string
  token: string
  media: string
  type: string
  dailyStatistic: DailyStatistic[]
}

type Advertising = {
  id: number
  image: string
  name: string
  tracker: string
  advertiser: string
  campaign: Campaign[]
}

// GraphQL 응답 타입
type GetCampaignResult = {
  advertising: Advertising
}

// 내부 사용 타입 (응답 변환 후)
type ResponseCampaign = {
  id: number
  name: string
  token: string
  media: string
  type: string
  dailyStatistic: DailyStatistic
}

type Response = {
  id: number
  image: string
  name: string
  tracker: string
  advertiser: string
  media: string[]
  campaign: ResponseCampaign[]
}

// GraphQL 쿼리
const GET_CAMPAIGN = gql`
  query campaign($id: Int!, $startDate: DateTime!, $endDate: DateTime!) {
    advertising(id: $id) {
      id
      image
      name
      advertiser
      tracker
      campaign {
        id
        media
        name
        token
        type
        dailyStatistic(startDate: $startDate, endDate: $endDate) {
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
          createdDate
        }
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

export const useCampaignStore = defineStore('campaign', {
  state: () => ({
    advertising: null as Response | null,
    currentDateRange: null as { startDate: string; endDate: string } | null,
    currentAdvertisingId: null as number | null,
  }),
  getters: {
    // 캠페인 데이터가 존재하는지 확인
    hasData: (state) => state.advertising !== null,
    // 특정 캠페인 조회
    getCampaign: (state) => (token: string) =>
      state.advertising?.campaign.find((cp) => cp.token === token),
  },
  actions: {
    async update(id: number, startDate: string, endDate: string): Promise<Response> {
      const { data } = await apolloClient.query<GetCampaignResult>({
        query: GET_CAMPAIGN,
        variables: { id, startDate, endDate },
      })

      const { advertising } = data

      const campaign: ResponseCampaign[] = advertising.campaign.map((cp) => ({
        id: cp.id,
        name: cp.name,
        token: cp.token,
        media: cp.media,
        type: cp.type,
        dailyStatistic: sumDailyStatistics(cp.dailyStatistic),
      }))

      const response: Response = {
        id: advertising.id,
        image: advertising.image,
        name: advertising.name,
        tracker: advertising.tracker,
        advertiser: advertising.advertiser,
        media: [...new Set(advertising.campaign.map((cp) => cp.media))], // 중복 제거
        campaign,
      }

      // state 업데이트
      this.advertising = response
      this.currentDateRange = { startDate, endDate }
      this.currentAdvertisingId = id

      return response
    },
    // token으로 campaign 조회 action (날짜 범위 조건 추가)
    async getCampaignByToken(
      token: string,
      advertisingId: number,
      startDate: string,
      endDate: string,
    ): Promise<ResponseCampaign | undefined> {
      // 현재 저장된 데이터와 요청한 날짜 범위/광고 ID가 다른 경우 데이터 갱신
      const needsUpdate =
        !this.advertising ||
        this.currentAdvertisingId !== advertisingId ||
        !this.currentDateRange ||
        this.currentDateRange.startDate !== startDate ||
        this.currentDateRange.endDate !== endDate

      if (needsUpdate) {
        await this.update(advertisingId, startDate, endDate)
      }

      if (!this.advertising) {
        return undefined
      }

      return this.advertising.campaign.find((cp) => cp.token === token)
    },
    // state 초기화
    clear() {
      this.advertising = null
      this.currentDateRange = null
      this.currentAdvertisingId = null
    },
  },
})
