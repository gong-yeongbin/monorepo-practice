<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import router from '@/router'

const userStore = useUserStore()

onMounted(() => {
  if (!userStore.isLogin) router.push('/login')
})
</script>

<template></template>

<style scoped></style>
