import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStore } from '../session'
import { useSession } from '@/composables/useSession'

describe('session store', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('is not authenticated when nothing is stored', () => {
    const store = useSessionStore()

    expect(store.isAuthenticated).toBe(false)
    expect(store.userId).toBeNull()
  })

  it('restores the user from the session', () => {
    useSession().setUserId('alice')

    const store = useSessionStore()

    expect(store.isAuthenticated).toBe(true)
    expect(store.userId).toBe('alice')
  })

  it('logs in with the username as user id and persists it', () => {
    const store = useSessionStore()

    store.login('alice')

    expect(store.userId).toBe('alice')
    expect(useSession().getUserId()).toBe('alice')
  })

  it('logs out and clears the session', () => {
    const store = useSessionStore()
    store.login('alice')

    store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(useSession().getUserId()).toBeNull()
  })
})
