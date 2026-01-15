import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client'
import gql from 'graphql-tag'

type Advertising = {
  id: number
  name: string
  image?: string
  advertiserId?: number
  trackerId?: number
  tracker?: string
  campaign?: Array<{ id: number }> | number
}

type GetAdvertisingsResult = {
  advertisings: Advertising[]
}

const GET_ADVERTISINGS = gql`
  query advertisings {
    advertisings {
      id
      name
      image
      advertiserId
      trackerId
      tracker
      campaign {
        id
      }
    }
  }
`

export const useAdvertisingStore = defineStore('advertising', {
  state: () => ({
    advertisings: null as Advertising[] | null,
  }),
  getters: {
    hasData: (state) => state.advertisings !== null && state.advertisings.length > 0,
    getAdvertising: (state) => (id: number) =>
      state.advertisings?.find((advertising) => advertising.id === id),
  },
  actions: {
    async fetchAll(): Promise<Advertising[]> {
      try {
        const { data } = await apolloClient.query<GetAdvertisingsResult>({
          query: GET_ADVERTISINGS,
        })

        // campaign을 배열 길이로 변환 (기존 API와 호환성을 위해)
        const advertisings: Advertising[] = data.advertisings.map((advertising) => ({
          ...advertising,
          image: advertising.image ?? '',
          name: advertising.name ?? '',
          tracker: advertising.tracker ?? '',
          campaign: Array.isArray(advertising.campaign)
            ? advertising.campaign.length
            : advertising.campaign ?? 0,
        }))

        this.advertisings = advertisings
        return advertisings
      } catch (error) {
        console.error('Failed to fetch advertisings:', error)
        throw error
      }
    },
    clear() {
      this.advertisings = null
    },
  },
})
