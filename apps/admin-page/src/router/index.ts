import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashBoard from '@/views/DashBoard.vue'
import Tracker from '@/views/TrackerView.vue'

import { useUserStore } from '@/stores/userStore.ts'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashBoard,
    meta: { requiresAuth: true },
  },
  {
    path: '/tracker',
    name: 'tracker',
    component: Tracker,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLogin) {
    return '/login'
  }
})

export default router
