import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
import gql from 'graphql-tag'

// 타입 정의 통합 및 구조화
type DailyStatistic = {
  viewCode: string
  token: string
  pubId: string | null
  subId: string | null
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
  createdDate?: string
}

// CampaignConfig 타입 추가
type CampaignConfig = {
  campaignId: number
  sendMedia: boolean
  trackerEventName: string
  adminEventName: string
  mediaEventName: string
}

type Campaign = {
  id: number
  name: string
  token: string
  media: string
  type: string
  isActive: boolean
  trackerName?: string
  trackerTrackingUrl?: string
  config?: CampaignConfig[]
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

// 내부 사용 타입 (응답 변환 후) - 문자열 필드 제외, 숫자 필드만 합산
type ResponseCampaign = {
  id: number
  name: string
  token: string
  media: string
  type: string
  isActive: boolean
  trackerName?: string
  trackerTrackingUrl?: string
  config?: CampaignConfig[]
  dailyStatistic: {
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
        token
        name
        type
        isActive
        trackerName
        trackerTrackingUrl
        media
        config {
          sendMedia
          trackerEventName
          adminEventName
          mediaEventName
        }
        dailyStatistic(startDate: $startDate, endDate: $endDate) {
          viewCode
          token
          pubId
          subId
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

// 숫자 통계 필드 목록 (합산할 필드만)
const NUMERIC_STATISTIC_FIELDS = [
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

// 숫자 필드만 초기값 생성 함수
const createEmptyStatistic = () => ({
  click: 0,
  install: 0,
  registration: 0,
  retention: 0,
  purchase: 0,
  revenue: 0,
  etc1: 0,
  etc2: 0,
  etc3: 0,
  etc4: 0,
  etc5: 0,
  unregistered: 0,
})

// 일일 통계 배열을 합산하는 함수 (숫자 필드만 합산)
const sumDailyStatistics = (statistics: DailyStatistic[]) => {
  return statistics.reduce((acc, curr) => {
    return {
      click: acc.click + curr.click,
      install: acc.install + curr.install,
      registration: acc.registration + curr.registration,
      retention: acc.retention + curr.retention,
      purchase: acc.purchase + curr.purchase,
      revenue: acc.revenue + curr.revenue,
      etc1: acc.etc1 + curr.etc1,
      etc2: acc.etc2 + curr.etc2,
      etc3: acc.etc3 + curr.etc3,
      etc4: acc.etc4 + curr.etc4,
      etc5: acc.etc5 + curr.etc5,
      unregistered: acc.unregistered + curr.unregistered,
    }
  }, createEmptyStatistic())
}

export const useCampaignStore = defineStore('campaign', {
  state: () => ({
    advertising: null as Response | null,
    rawDailyStatistics: null as Map<string, DailyStatistic[]> | null, // 캠페인별 원본 dailyStatistic 저장
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
      try {
        const { data } = await apolloClient.query<GetCampaignResult>({
          query: GET_CAMPAIGN,
          variables: { id, startDate, endDate },
        })

        const { advertising } = data

        // 원본 dailyStatistic 저장 (캠페인 token을 키로)
        const rawStats = new Map<string, DailyStatistic[]>()
        advertising.campaign.forEach((cp) => {
          rawStats.set(cp.token, cp.dailyStatistic)
        })

        const campaign: ResponseCampaign[] = advertising.campaign.map((cp) => ({
          id: cp.id,
          name: cp.name,
          token: cp.token,
          media: cp.media,
          type: cp.type,
          isActive: cp.isActive,
          trackerName: cp.trackerName,
          trackerTrackingUrl: cp.trackerTrackingUrl,
          config: cp.config,
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
        this.rawDailyStatistics = rawStats
        this.currentDateRange = { startDate, endDate }
        this.currentAdvertisingId = id

        return response
      } catch (error) {
        console.error('Failed to fetch campaign data:', error)
        throw error
      }
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
    // campaign id로 config 조회하는 action 함수 (state에서 조회)
    getCampaignConfigById(campaignId: number): CampaignConfig[] | null {
      // state에서 campaign 찾기
      const campaign = this.advertising?.campaign.find((cp) => cp.id === campaignId)

      if (!campaign) {
        return null
      }

      return campaign.config || null
    },
    // 날짜별 원본 데이터 가져오기
    getDailyStatisticsByToken(
      token: string,
      advertisingId: number,
      startDate: string,
      endDate: string,
    ): DailyStatistic[] {
      // 데이터가 없거나 날짜 범위가 다르면 빈 배열 반환
      if (
        !this.rawDailyStatistics ||
        this.currentAdvertisingId !== advertisingId ||
        !this.currentDateRange ||
        this.currentDateRange.startDate !== startDate ||
        this.currentDateRange.endDate !== endDate
      ) {
        return []
      }

      return this.rawDailyStatistics.get(token) || []
    },
    // state 초기화
    clear() {
      this.advertising = null
      this.rawDailyStatistics = null
      this.currentDateRange = null
      this.currentAdvertisingId = null
    },
  },
})
