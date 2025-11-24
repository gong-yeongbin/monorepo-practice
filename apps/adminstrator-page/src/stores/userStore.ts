import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
  }),
  actions: {
    login() {
      this.isLogin = true
    },
    logout() {
      this.isLogin = false
    },
  },
  persist: true,
})
