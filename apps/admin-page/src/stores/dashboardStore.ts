import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
import gql from 'graphql-tag'

type Advertising = {
  id: number
  name: string
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

type GetDashboardResult = {
  advertisings: Advertising[]
}

type Dashboard = {
  id: number
  name: string
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

export const useDashboardStore = defineStore('dashboard', {
  actions: {
    async update(baseDate: string) {
      const { data } = await apolloClient.query<GetDashboardResult>({
        query: GET_DASHBOARD,
        variables: { baseDate },
      })
      return data.advertisings.map((advertising) => {
        const sum = advertising.dailyStatistic.reduce(
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
        )
        return { id: advertising.id, name: advertising.name, ...sum } as Dashboard
      })
    },
  },
})
