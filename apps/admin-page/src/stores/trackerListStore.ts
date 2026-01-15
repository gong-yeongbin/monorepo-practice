import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client'
import gql from 'graphql-tag'

type Tracker = {
  id: number
  name: string
  installPostbackUrl: string
  eventPostbackUrl: string
  trackingUrl: string
}

type GetTrackerResult = {
  tracker: Tracker[]
}

const GET_TRACKER = gql`
  query tracker {
    tracker {
      id
      name
      installPostbackUrl
      eventPostbackUrl
      trackingUrl
    }
  }
`

export const useTrackerListStore = defineStore('tracker', {
  state: () => ({
    trackerList: null as Tracker[] | null,
  }),
  getters: {
    hasData: (state) => state.trackerList !== null && state.trackerList.length > 0,
    getTracker: (state) => (id: number) => state.trackerList?.find((tracker) => tracker.id === id),
  },
  actions: {
    async fetchAll(): Promise<Tracker[]> {
      try {
        const { data } = await apolloClient.query<GetTrackerResult>({
          query: GET_TRACKER,
        })

        this.trackerList = data.tracker
        return data.tracker
      } catch (error) {
        console.error('Failed to fetch tracker list:', error)
        throw error
      }
    },
    clear() {
      this.trackerList = null
    },
  },
})
