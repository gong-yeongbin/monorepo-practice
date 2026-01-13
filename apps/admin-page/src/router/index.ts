import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'
import LoginView from '@/views/LoginView.vue'
import DashBoardView from '@/views/DashBoardView.vue'
import AdvertisingListView from '@/views/AdvertisingListView.vue'
import AdvertisingDetailView from '@/views/AdvertisingDetailView.vue'
import CampaignView from '@/views/CampaignView.vue'
import MediaView from '@/views/MediaView.vue'
import TrackerListView from '@/views/TrackerListView.vue'
import MediaListView from '@/views/MediaListView.vue'
import MediaDetailView from '@/views/MediaDetailView.vue'
import CampaignConfigView from '@/views/CampaignConfigView.vue'

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
    component: AdvertisingListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/advertising/:id',
    name: 'advertisingDetail',
    component: AdvertisingDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/campaign',
    name: 'campaign',
    component: CampaignView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/campaign/:id/config',
    name: 'campaignConfig',
    component: CampaignConfigView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/campaign/:token',
    name: 'media',
    component: MediaView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/campaign/:token/detail',
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
