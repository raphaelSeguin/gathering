import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GatheringEditPage from '../GatheringEditPage.vue'
import GatheringForm from '@/components/GatheringForm.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { useGatheringsApi } from '@/composables/useGatheringsApi'
import { ApiError } from '@/api/client'
import { aGathering } from '@/__tests__/fixtures'
import { aTestRouter } from '@/__tests__/helpers'
import { toDateTimeLocal } from '@/utils/dateTimeLocal'

vi.mock('@/composables/useGatheringsApi', () => import('@/__tests__/gatheringsApiMock'))

const api = vi.mocked(useGatheringsApi())

const gathering = aGathering({
  id: '42',
  title: 'Vue meetup',
  description: 'Talks about Vue',
  date: '2099-01-01T18:30:00.000Z',
  capacity: 10,
  organizerId: 'alice',
})

async function mountPage() {
  const router = await aTestRouter('/gatherings/42/edit')
  const wrapper = mount(GatheringEditPage, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('GatheringEditPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    api.get.mockResolvedValue(gathering)
  })

  it('loads the gathering and prefills the edit form', async () => {
    const { wrapper } = await mountPage()

    expect(api.get).toHaveBeenCalledWith('42')
    expect(wrapper.get('h1').text()).toBe('Edit gathering')
    const form = wrapper.getComponent(GatheringForm)
    expect(form.props('mode')).toBe('edit')
    expect(form.props('initialValues')).toEqual({
      title: 'Vue meetup',
      description: 'Talks about Vue',
      date: toDateTimeLocal('2099-01-01T18:30:00.000Z'),
      capacity: 10,
    })
  })

  it('shows the error when the gathering cannot be loaded', async () => {
    api.get.mockRejectedValue(new ApiError('Gathering not found', 404))

    const { wrapper } = await mountPage()

    expect(wrapper.findComponent(GatheringForm).exists()).toBe(false)
    expect(wrapper.getComponent(ErrorMessage).text()).toBe('Gathering not found')
  })

  it('updates the capacity and goes home', async () => {
    api.updateCapacity.mockResolvedValue({ ...gathering, capacity: 25 })
    const { wrapper, router } = await mountPage()

    wrapper.getComponent(GatheringForm).vm.$emit('submit', { ...gathering, capacity: 25 })
    await flushPromises()

    expect(api.updateCapacity).toHaveBeenCalledWith('42', 25)
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('stays on the form and shows the server error when the update is rejected', async () => {
    api.updateCapacity.mockRejectedValue(new ApiError('Capacity must be at least 3', 400))
    const { wrapper, router } = await mountPage()

    wrapper.getComponent(GatheringForm).vm.$emit('submit', { ...gathering, capacity: 1 })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/gatherings/42/edit')
    expect(wrapper.getComponent(GatheringForm).props('serverError')).toBe('Capacity must be at least 3')
  })
})
