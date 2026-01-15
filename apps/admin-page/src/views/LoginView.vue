<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const userId = ref('')
const userPw = ref('')

const onLogin = async () => {
  if (!userId.value) {
    alert('ID를 입력하세요.')
    return
  }
  if (!userPw.value) {
    alert('PW를 입력하세요.')
    return
  }

  try {
    const response = await userStore.login(userId.value, userPw.value)
    if (response) {
      await router.push('/dashboard')
    }
  } catch (error) {
    console.error('로그인 실패:', error)
    alert('로그인에 실패했습니다.')
  }
}
</script>

<template>
  <div class="login-page">
    <form @submit.prevent="onLogin">
      <input type="text" v-model="userId" placeholder="아이디" />
      <input type="password" v-model="userPw" placeholder="비밀번호" />
      <button type="submit">로그인</button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  width: 350px;
  margin: 0px auto;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-page form {
  display: flex;
  gap: 10px;
}
</style>
