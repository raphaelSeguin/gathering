<script setup lang="ts">
import { useRouter } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const router = useRouter()

async function onSubmit(username: string) {
  session.login(username)
  await router.push('/')
}
</script>

<template>
  <main class="page page--narrow">
    <h1>Log in</h1>
    <LoginForm @submit="onSubmit" />
  </main>
</template>
