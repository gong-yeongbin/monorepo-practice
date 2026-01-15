import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client'
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
  state: () => ({
    mediaList: null as Media[] | null,
  }),
  getters: {
    hasData: (state) => state.mediaList !== null && state.mediaList.length > 0,
    getMedia: (state) => (id: number) => state.mediaList?.find((media) => media.id === id),
  },
  actions: {
    async fetchAll(): Promise<Media[]> {
      try {
        const { data } = await apolloClient.query<GetMediaResult>({
          query: GET_MEDIA,
        })

        this.mediaList = data.media
        return data.media
      } catch (error) {
        console.error('Failed to fetch media list:', error)
        throw error
      }
    },
    clear() {
      this.mediaList = null
    },
  },
})
