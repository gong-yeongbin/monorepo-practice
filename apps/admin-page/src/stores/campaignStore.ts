import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
import gql from 'graphql-tag'

type Advertising = {
  id: number
  image: string
  name: string
  tracker: string
  advertiser: string
  campaign: Campaign[]
}

type Campaign = {
  id: number
  name: string
  token: string
  media: string
  type: string
  dailyStatistic: DailyStatistic[]
}

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

type GetCampaignResult = {
  advertising: Advertising
}

type ResponseDailyStatistic = {
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
type ResponseCampaign = {
  id: number
  name: string
  token: string
  media: string
  type: string
  dailyStatistic: ResponseDailyStatistic
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

export const useCampaignStore = defineStore('campaign', {
  actions: {
    async update(id: number, startDate: string, endDate: string) {
      const { data } = await apolloClient.query<GetCampaignResult>({
        query: GET_CAMPAIGN,
        variables: { id, startDate, endDate },
      })

      const advertising = data.advertising
      const campaign = advertising.campaign.map((cp) => {
        return {
          id: cp.id,
          name: cp.name,
          token: cp.token,
          media: cp.media,
          type: cp.type,
          dailyStatistic: cp.dailyStatistic.reduce(
            (acc, curr) => {
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
            },
            {
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
            },
          ),
        }
      })
      return {
        id: advertising.id,
        image: advertising.image,
        name: advertising.name,
        tracker: advertising.tracker,
        advertiser: advertising.advertiser,
        media: advertising.campaign.map((cp) => cp.media),
        campaign: campaign,
      } as Response
    },
  },
})
