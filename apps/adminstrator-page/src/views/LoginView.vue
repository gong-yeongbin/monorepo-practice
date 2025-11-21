<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const user_id = ref('')
const user_pw = ref('')

async function onLogin() {
  if (!user_id.value) return alert('ID를 입력하세요.')
  if (!user_pw.value) return alert('PW를 입력하세요.')

  try {
    const response = await axios.post('http://localhost:3002/auth/sign-in', {
      userId: user_id.value,
      password: user_pw.value,
    })

    console.log(response)
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <div class="login-page">
    <form @submit.prevent="onLogin">
      <input type="text" v-model="user_id" placeholder="아이디" />
      <input type="password" v-model="user_pw" placeholder="비밀번호" />
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
