import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
  }),
  actions: {
    async login(userId: string, password: string) {
      const response = await axios.post(
        'http://localhost:3002/auth/sign-in',
        { userId, password },
        { withCredentials: true },
      )
      if (response.status === 200) {
        return (this.isLogin = true)
      }

      return this.isLogin
    },
    logout() {
      this.isLogin = false
    },
  },
  persist: true,
})
