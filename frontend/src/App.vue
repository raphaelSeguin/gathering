<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/AppHeader.vue'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const { userId } = storeToRefs(session)
const router = useRouter()

async function onLogout() {
  session.logout()
  await router.push('/login')
}
</script>

<template>
  <AppHeader v-if="userId" :username="userId" @logout="onLogout" />
  <RouterView />
</template>
