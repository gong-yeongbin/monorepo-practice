<script setup lang="ts">
import BaseSidebar from '@/components/BaseSidebar.vue'
</script>

<template>
  <div class="layout">
    <BaseSidebar />

    <main class="content">
      <!-- 여기 안에서 DashboardView 같은 view 를 렌더 -->
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
}

/* 사이드바가 fixed 이기 때문에 padding-left 로 내용 밀어주기 */
.content {
  flex: 1;
  padding-left: 220px; /* sidebar width 와 동일하게 */
  min-height: 100vh;
  background: #f3f4f6;
  padding-top: 16px;
  padding-right: 16px;
}
</style>
