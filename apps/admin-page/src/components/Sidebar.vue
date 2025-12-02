<script setup lang="ts">
const menuItems = [
  { path: '/dashboard', label: '대시보드' },
  { path: '/advertising', label: '광고' },
  { path: '/tracker', label: '트래커' },
  { path: '/media', label: '매체' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="logo">Mecross</div>

    <nav class="menu">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        active-class="active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100px;
  background: #1f2933;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
}

.logo {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 24px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  padding: 10px 12px;
  border-radius: 6px;
  color: #e5e7eb;
  text-decoration: none;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.menu-item.active {
  background: #2563eb;
  color: #fff;
}
</style>
