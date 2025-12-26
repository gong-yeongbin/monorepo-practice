import { defineStore } from 'pinia'
import { apolloClient } from '@/apollo-client.ts'
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
    async login(userId: string, password: string) {
      const { data } = await apolloClient.mutate({
        mutation: SET_TOKEN,
        variables: { userId, password },
      })

      return (this.isLogin = data.login)
    },
    logout() {
      this.isLogin = false
    },
  },
  persist: true,
})
