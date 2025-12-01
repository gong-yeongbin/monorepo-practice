<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <Header />
      <div class="page">
        <!-- 여기 안에서 DashboardView 같은 view 를 렌더 -->
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  /* 사이드바는 fixed 라서 flex 에는 안 들어와도 됨 */
}

/* 왼쪽 고정 사이드바 */
:deep(.sidebar) {
  position: fixed;
  inset: 0 auto 0 0; /* top:0, left:0, bottom:0 */
  width: 220px; /* 고정 폭 */
}

/* 오른쪽 콘텐츠 영역 */
.content {
  /* 사이드바 폭만큼 밀어줌 */
  margin-left: 220px;
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
}

.page {
  padding: 16px;
}
</style>
