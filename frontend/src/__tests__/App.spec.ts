import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useSessionStore } from '@/stores/session'
import { aTestRouter } from './helpers'

async function mountApp(path: string) {
  const router = await aTestRouter(path)
  const wrapper = mount(App, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('has no header when not authenticated', async () => {
    const { wrapper } = await mountApp('/login')

    expect(wrapper.findComponent(AppHeader).exists()).toBe(false)
  })

  it('shows the header with the current user when authenticated', async () => {
    useSessionStore().login('alice')

    const { wrapper } = await mountApp('/')

    expect(wrapper.getComponent(AppHeader).props('username')).toBe('alice')
  })

  it('logs out and goes to the login page', async () => {
    useSessionStore().login('alice')
    const { wrapper, router } = await mountApp('/')

    wrapper.getComponent(AppHeader).vm.$emit('logout')
    await flushPromises()

    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
    expect(wrapper.findComponent(AppHeader).exists()).toBe(false)
  })
})
