import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSession } from '@/composables/useSession'

export const useSessionStore = defineStore('session', () => {
  const session = useSession()
  const userId = ref<string | null>(session.getUserId())
  const isAuthenticated = computed(() => userId.value !== null)

  function login(username: string) {
    session.setUserId(username)
    userId.value = username
  }

  function logout() {
    session.clear()
    userId.value = null
  }

  return { userId, isAuthenticated, login, logout }
})
