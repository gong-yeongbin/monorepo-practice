import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
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
  actions: {
    async get() {
      const { data } = await apolloClient.query<GetTrackerResult>({
        query: GET_TRACKER,
      })
      return data.tracker
    },
  },
})
