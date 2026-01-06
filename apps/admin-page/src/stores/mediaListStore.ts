import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
import gql from 'graphql-tag'

type Media = {
  id: number
  name: string
  installPostbackUrl: string
  eventPostbackUrl: string
}

type GetMediaResult = {
  media: Media[]
}

const GET_MEDIA = gql`
  query media {
    media {
      id
      name
      installPostbackUrl
      eventPostbackUrl
    }
  }
`

export const useMediaListStore = defineStore('media', {
  actions: {
    async get() {
      const { data } = await apolloClient.query<GetMediaResult>({
        query: GET_MEDIA,
      })
      return data.media
    },
  },
})
