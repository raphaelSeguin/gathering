import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomePage from '../HomePage.vue'
import { useSessionStore } from '@/stores/session'
import { useGatheringsApi } from '@/composables/useGatheringsApi'
import { ApiError } from '@/api/client'
import { aGathering } from '@/__tests__/fixtures'

vi.mock('@/composables/useGatheringsApi', () => import('@/__tests__/gatheringsApiMock'))

const api = vi.mocked(useGatheringsApi())

function section(wrapper: VueWrapper, heading: string) {
  const found = wrapper.findAll('section').find((s) => s.get('h2').text() === heading)
  if (!found) throw new Error(`No section "${heading}"`)
  return found
}

async function mountHome() {
  const wrapper = mount(HomePage, { global: { stubs: { RouterLink: RouterLinkStub } } })
  await flushPromises()
  return wrapper
}

describe('HomePage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    useSessionStore().login('alice')
    vi.clearAllMocks()
    api.list.mockResolvedValue([
      aGathering({ id: 'open', title: 'Open one' }),
      aGathering({ id: 'joined', title: 'Joined one', myStatus: 'confirmed' }),
      aGathering({ id: 'mine', title: 'My own', organizerId: 'alice' }),
    ])
  })

  it('shows the three sections from the loaded gatherings', async () => {
    const wrapper = await mountHome()

    expect(api.list).toHaveBeenCalledOnce()
    expect(section(wrapper, 'Open gatherings').text()).toContain('Open one')
    expect(section(wrapper, 'My registrations').text()).toContain('Joined one')
    expect(section(wrapper, 'Organized by me').text()).toContain('My own')
  })

  it('registers, announces the status and moves the gathering to my registrations', async () => {
    api.register.mockResolvedValue({ status: 'waitlisted' })
    const wrapper = await mountHome()

    const button = section(wrapper, 'Open gatherings').get('button')
    expect(button.text()).toBe('Register')
    expect(button.attributes('aria-label')).toBe('Register for Open one')
    await button.trigger('click')
    await flushPromises()

    expect(api.register).toHaveBeenCalledWith('open')
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('You are on the waitlist for Open one')
    expect(section(wrapper, 'Open gatherings').text()).not.toContain('Open one')
    expect(section(wrapper, 'My registrations').text()).toContain('Open one')
    expect(section(wrapper, 'My registrations').text()).toContain('Waitlisted')
  })

  it('announces a confirmed registration', async () => {
    api.register.mockResolvedValue({ status: 'confirmed' })
    const wrapper = await mountHome()

    await section(wrapper, 'Open gatherings').get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('[aria-live="polite"]').text()).toBe('You are registered for Open one')
  })

  it('shows the error when registration fails', async () => {
    api.register.mockRejectedValue(new ApiError('Already registered', 409))
    const wrapper = await mountHome()

    await section(wrapper, 'Open gatherings').get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('[aria-live="assertive"]').text()).toBe('Already registered')
  })

  it('offers to withdraw only from my registrations', async () => {
    const wrapper = await mountHome()

    const withdrawButtons = wrapper.findAll('button').filter((b) => b.text() === 'withdraw')
    expect(withdrawButtons).toHaveLength(1)
    expect(withdrawButtons[0]!.attributes('aria-label')).toBe('Withdraw from Joined one')
  })

  it('withdraws and removes the gathering from my registrations', async () => {
    api.withdraw.mockResolvedValue(undefined)
    api.get.mockResolvedValue(aGathering({ id: 'joined', title: 'Joined one', myStatus: 'unregistered' }))
    const wrapper = await mountHome()

    await section(wrapper, 'My registrations').get('button').trigger('click')
    await flushPromises()

    expect(api.withdraw).toHaveBeenCalledWith('joined')
    expect(section(wrapper, 'My registrations').text()).not.toContain('Joined one')
  })

  it('keeps the gathering and shows the error when withdrawal fails', async () => {
    api.withdraw.mockRejectedValue(new ApiError('Not registered', 409))
    const wrapper = await mountHome()

    await section(wrapper, 'My registrations').get('button').trigger('click')
    await flushPromises()

    expect(section(wrapper, 'My registrations').text()).toContain('Joined one')
    expect(wrapper.get('[aria-live="assertive"]').text()).toBe('Not registered')
  })

  it('links each organized gathering to its edit form', async () => {
    const wrapper = await mountHome()

    const link = section(wrapper, 'Organized by me').getComponent(RouterLinkStub)
    expect(link.text()).toBe('Edit')
    expect(link.attributes('aria-label')).toBe('Edit My own')
    expect(link.props('to')).toBe('/gatherings/mine/edit')
  })
})
