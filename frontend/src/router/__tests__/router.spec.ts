import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from '../index'
import { useSessionStore } from '@/stores/session'

async function navigate(path: string) {
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  return router.currentRoute.value.path
}

describe('router', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it.each(['/', '/gatherings/new', '/gatherings/42/edit'])(
    'redirects %s to /login when not authenticated',
    async (path) => {
      expect(await navigate(path)).toBe('/login')
    },
  )

  it.each(['/', '/gatherings/new', '/gatherings/42/edit'])(
    'gives access to %s when authenticated',
    async (path) => {
      useSessionStore().login('alice')

      expect(await navigate(path)).toBe(path)
    },
  )

  it('redirects /login to home when already authenticated', async () => {
    useSessionStore().login('alice')

    expect(await navigate('/login')).toBe('/')
  })
})
