<script setup lang="ts">
import Tracker from '@/components/Tracker.vue'
import CampaignStatistic from '@/components/CampaignStatistic.vue'

import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
const route = useRoute()
</script>

<template>
  <DefaultLayout>
    <div class="tracker-wrap">
      <Tracker :name="route.params.name" />
    </div>

    <div class="campaign-wrap">
      <CampaignStatistic :name="route.params.name" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.tracker-wrap {
  margin-bottom: 50px; /* 원하는 간격(px) */
}
</style>
