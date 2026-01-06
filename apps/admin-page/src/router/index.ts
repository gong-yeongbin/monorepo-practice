import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashBoardView from '@/views/DashBoardView.vue'
import Tracker from '@/views/TrackerView.vue'
import Media from '@/views/MediaView.vue'
import Advertising from '@/views/AdvertisingView.vue'
import CampaignView from '@/views/CampaignView.vue'

import { useUserStore } from '@/stores/userStore.ts'
import CampaignDateStatistic from '@/components/CampaignDateStatistic.vue'

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
    component: DashBoardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/advertising',
    name: 'advertising',
    component: Advertising,
    meta: { requiresAuth: true },
  },
  {
    path: '/advertising/:id/campaign',
    name: 'campaign',
    component: CampaignView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/tracker',
    name: 'tracker',
    component: Tracker,
    meta: { requiresAuth: true },
  },
  {
    path: '/media',
    name: 'media',
    component: Media,
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
