import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client'
import gql from 'graphql-tag'

const SET_TOKEN = gql`
  mutation login($userId: String!, $password: String!) {
    login(userId: $userId, password: $password)
  }
`

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
  }),
  actions: {
    async login(userId: string, password: string): Promise<boolean> {
      try {
        const { data } = await apolloClient.mutate<{ login: boolean }>({
          mutation: SET_TOKEN,
          variables: { userId, password },
        })

        if (!data?.login) {
          return false
        }

        this.isLogin = data.login
        return data.login
      } catch (error) {
        console.error('Failed to login:', error)
        this.isLogin = false
        throw error
      }
    },
    logout() {
      this.isLogin = false
    },
  },
  persist: true,
})
