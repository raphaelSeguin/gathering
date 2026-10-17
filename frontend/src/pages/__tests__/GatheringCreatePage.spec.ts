import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GatheringCreatePage from '../GatheringCreatePage.vue'
import GatheringForm from '@/components/GatheringForm.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { useGatheringsApi } from '@/composables/useGatheringsApi'
import { useGatheringsStore } from '@/stores/gatherings'
import { ApiError } from '@/api/client'
import { aGathering } from '@/__tests__/fixtures'
import { aTestRouter } from '@/__tests__/helpers'

vi.mock('@/composables/useGatheringsApi', () => import('@/__tests__/gatheringsApiMock'))

const api = vi.mocked(useGatheringsApi())

const values = {
  title: 'Vue meetup',
  description: 'Talks about Vue',
  date: '2099-01-01T18:30',
  capacity: 10,
}

async function mountPage() {
  const router = await aTestRouter('/gatherings/new')
  const wrapper = mount(GatheringCreatePage, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('GatheringCreatePage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows an empty creation form', async () => {
    const { wrapper } = await mountPage()

    expect(wrapper.get('h1').text()).toBe('New gathering')
    expect(wrapper.getComponent(GatheringForm).props('mode')).toBe('create')
  })

  it('creates the gathering with an ISO date and goes home', async () => {
    api.create.mockResolvedValue(aGathering())
    const { wrapper, router } = await mountPage()

    wrapper.getComponent(GatheringForm).vm.$emit('submit', values)
    await flushPromises()

    expect(api.create).toHaveBeenCalledWith({
      ...values,
      date: new Date('2099-01-01T18:30').toISOString(),
    })
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('stays on the form and shows the server error when creation fails', async () => {
    api.create.mockRejectedValue(new ApiError('Event must be created in the future', 400))
    const { wrapper, router } = await mountPage()

    wrapper.getComponent(GatheringForm).vm.$emit('submit', values)
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/gatherings/new')
    expect(wrapper.getComponent(ErrorMessage).text()).toBe('Event must be created in the future')
  })

  it('does not show an error left over from another page', async () => {
    useGatheringsStore().error = 'Old error'

    const { wrapper } = await mountPage()

    expect(wrapper.getComponent(ErrorMessage).text()).toBe('')
  })
})
