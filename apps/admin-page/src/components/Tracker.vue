<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

interface Advertising {
  id: string
  name: string
  image: string
  advertiserName: string
  trackerName: string
  campaign: Campaign[]
}

interface Campaign {
  id: string
  token: string
  name: string
  type: string
  isActive: boolean
  trackerTrackingUrl: string
  trackerName: string
  advertisingName: string
  mediaName: string
}

const props = defineProps<{
  name: string | string[] | undefined
}>()

const advertising = ref<Advertising>()
const mediaList = computed(() => advertising?.value?.campaign.map((campaign) => campaign.mediaName))

onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3002/advertising/${props.name}`, {
      withCredentials: true,
    })

    advertising.value = response.data.data
  } catch (error) {
    // TODO: 에러 처리 (토스트, 알럿 등)
    console.error(error)
  }
})
</script>

<template>
  <section class="ad-detail">
    <div class="ad-detail__left">
      <img :src="advertising?.image" alt="ad thumbnail" class="ad-detail__thumb" />
    </div>

    <div class="ad-detail__right">
      <h2 class="ad-detail__title">
        {{ name }}
      </h2>

      <div class="ad-detail__row">
        <span class="ad-detail__label">광고주: </span>
        <span class="ad-detail__value">{{ advertising?.advertiserName }}</span>
      </div>

      <div class="ad-detail__row">
        <span class="ad-detail__label">트래킹 솔루션: </span>
        <span class="ad-detail__value">{{ advertising?.trackerName }}</span>
      </div>

      <div class="ad-detail__row">
        <span class="ad-detail__label"> 매체사({{ advertising?.campaign.length }}): </span>
        <span class="ad-detail__value">
          {{ mediaList?.join(', ') }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ad-detail {
  display: flex;
  align-items: center;
  gap: 16px;
}
.ad-detail__thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}
.ad-detail__title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}
.ad-detail__row {
  font-size: 13px;
  color: #555;
}
.ad-detail__label {
  font-weight: 500;
  margin-right: 4px;
}
</style>
