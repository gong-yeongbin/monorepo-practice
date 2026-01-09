import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashBoardView from '@/views/DashBoardView.vue'
import Advertising from '@/views/AdvertisingView.vue'
import CampaignView from '@/views/CampaignView.vue'
import MediaView from '@/views/MediaView.vue'
import { useUserStore } from '@/stores/userStore.ts'
import TrackerListView from '@/views/TrackerListView.vue'
import MediaListView from '@/views/MediaListView.vue'
import MediaDetailView from '@/views/MediaDetailView.vue'

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
    path: '/advertising/:id/campaign/:token',
    name: 'media',
    component: MediaView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/advertising/:id/campaign/:token/detail',
    name: 'mediaDetail',
    component: MediaDetailView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/tracker',
    name: 'tracker',
    component: TrackerListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/media',
    name: 'mediaList',
    component: MediaListView,
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
