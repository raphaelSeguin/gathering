import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '../LoginPage.vue'
import LoginForm from '@/components/LoginForm.vue'
import { useSessionStore } from '@/stores/session'
import { aTestRouter } from '@/__tests__/helpers'

describe('LoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('logs the user in and goes home', async () => {
    const router = await aTestRouter('/login')
    const wrapper = mount(LoginPage, { global: { plugins: [router] } })

    expect(wrapper.get('h1').text()).toBe('Log in')
    wrapper.getComponent(LoginForm).vm.$emit('submit', 'alice')
    await flushPromises()

    expect(useSessionStore().userId).toBe('alice')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
