<script setup lang="ts"></script>

<template>
  <header class="header">
    <div class="right">
      <span class="username"> {{ '@@' }} </span>
      <button class="logout-btn">로그아웃</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logout-btn {
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  cursor: pointer;
  font-size: 10px;
}
</style>
