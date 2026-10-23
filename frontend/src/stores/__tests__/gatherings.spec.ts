import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGatheringsStore } from '../gatherings'
import { useSessionStore } from '../session'
import { aGathering } from '@/__tests__/fixtures'
import { ApiError } from '@/api/client'
import { useGatheringsApi } from '@/composables/useGatheringsApi'

vi.mock('@/composables/useGatheringsApi', () => import('@/__tests__/gatheringsApiMock'))

describe('gatherings store — sections', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    useSessionStore().login('alice')
  })

  const notRegistered = aGathering({ id: 'a' })
  const confirmed = aGathering({ id: 'b', myStatus: 'confirmed' })
  const waitlisted = aGathering({ id: 'c', myStatus: 'waitlisted' })
  const mine = aGathering({ id: 'd', organizerId: 'alice' })

  function storeWithAll() {
    const store = useGatheringsStore()
    store.items = [notRegistered, confirmed, waitlisted, mine]
    return store
  }

  it('lists available gatherings: not mine and not registered', () => {
    expect(storeWithAll().available).toEqual([notRegistered])
  })

  it('lists joined gatherings: confirmed or waitlisted', () => {
    expect(storeWithAll().joined).toEqual([confirmed, waitlisted])
  })

  it('lists organized gatherings: the ones I organize', () => {
    expect(storeWithAll().organized).toEqual([mine])
  })
})

describe('gatherings store — actions', () => {
  const api = vi.mocked(useGatheringsApi())

  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    useSessionStore().login('alice')
    vi.clearAllMocks()
  })

  it('fetches all gatherings', async () => {
    const gatherings = [aGathering({ id: 'a' }), aGathering({ id: 'b' })]
    api.list.mockResolvedValue(gatherings)
    const store = useGatheringsStore()

    await store.fetchAll()

    expect(store.items).toEqual(gatherings)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('exposes the error message when fetching fails', async () => {
    api.list.mockRejectedValue(new ApiError('Server down', 500))
    const store = useGatheringsStore()

    await store.fetchAll()

    expect(store.error).toBe('Server down')
    expect(store.loading).toBe(false)
  })

  it('fetches one gathering and keeps it in the items', async () => {
    const gathering = aGathering({ id: 'a', organizerId: 'alice' })
    api.get.mockResolvedValue(gathering)
    const store = useGatheringsStore()

    await store.fetchOne('a')

    expect(api.get).toHaveBeenCalledWith('a')
    expect(store.items).toEqual([gathering])
  })

  it('registers: updates my status and records the last registration', async () => {
    api.register.mockResolvedValue({ status: 'waitlisted' })
    const store = useGatheringsStore()
    store.items = [aGathering({ id: 'a', title: 'Vue meetup', participantCount: 10 })]

    await store.register('a')

    expect(api.register).toHaveBeenCalledWith('a')
    expect(store.items[0]).toMatchObject({ myStatus: 'waitlisted', participantCount: 11 })
    expect(store.joined.map((g) => g.id)).toEqual(['a'])
    expect(store.lastRegistration).toEqual({ title: 'Vue meetup', status: 'waitlisted' })
  })

  it('keeps the gathering available when registration fails', async () => {
    api.register.mockRejectedValue(new ApiError('Already registered', 409))
    const store = useGatheringsStore()
    store.items = [aGathering({ id: 'a' })]

    await store.register('a')

    expect(store.available.map((g) => g.id)).toEqual(['a'])
    expect(store.error).toBe('Already registered')
  })

  it('withdraws: refreshes the gathering so it leaves my registrations', async () => {
    api.withdraw.mockResolvedValue(undefined)
    api.get.mockResolvedValue(aGathering({ id: 'a', myStatus: 'unregistered', participantCount: 9 }))
    const store = useGatheringsStore()
    store.items = [aGathering({ id: 'a', myStatus: 'confirmed', participantCount: 10 })]

    const success = await store.withdraw('a')

    expect(success).toBe(true)
    expect(api.withdraw).toHaveBeenCalledWith('a')
    expect(store.joined).toEqual([])
    expect(store.items[0]).toMatchObject({ myStatus: 'unregistered', participantCount: 9 })
  })

  it('keeps the gathering in my registrations when withdrawal fails', async () => {
    api.withdraw.mockRejectedValue(new ApiError('Not registered', 409))
    const store = useGatheringsStore()
    store.items = [aGathering({ id: 'a', myStatus: 'confirmed' })]

    const success = await store.withdraw('a')

    expect(success).toBe(false)
    expect(store.joined.map((g) => g.id)).toEqual(['a'])
    expect(store.error).toBe('Not registered')
  })

  it('creates a gathering and reports success', async () => {
    const created = aGathering({ id: 'new', organizerId: 'alice' })
    api.create.mockResolvedValue(created)
    const store = useGatheringsStore()
    const payload = { title: 'T', description: 'D', date: '2027-01-01T18:00:00.000Z', capacity: 5 }

    const success = await store.create(payload)

    expect(success).toBe(true)
    expect(api.create).toHaveBeenCalledWith(payload)
    expect(store.organized).toEqual([created])
  })

  it('reports failure when creation is rejected', async () => {
    api.create.mockRejectedValue(new ApiError('Event must be created in the future', 400))
    const store = useGatheringsStore()

    const success = await store.create({ title: 'T', description: 'D', date: '2020-01-01T00:00:00.000Z', capacity: 5 })

    expect(success).toBe(false)
    expect(store.error).toBe('Event must be created in the future')
  })

  it('updates the capacity of a gathering', async () => {
    const updated = aGathering({ id: 'a', organizerId: 'alice', capacity: 20 })
    api.updateCapacity.mockResolvedValue(updated)
    const store = useGatheringsStore()
    store.items = [aGathering({ id: 'a', organizerId: 'alice', capacity: 10 })]

    const success = await store.updateCapacity('a', 20)

    expect(success).toBe(true)
    expect(api.updateCapacity).toHaveBeenCalledWith('a', 20)
    expect(store.items).toEqual([updated])
  })

  it('clears the error', () => {
    const store = useGatheringsStore()
    store.error = 'Old error'

    store.clearError()

    expect(store.error).toBeNull()
  })

  it('reports failure when the capacity update is rejected', async () => {
    api.updateCapacity.mockRejectedValue(new ApiError('Capacity must be at least 3', 400))
    const store = useGatheringsStore()

    const success = await store.updateCapacity('a', 1)

    expect(success).toBe(false)
    expect(store.error).toBe('Capacity must be at least 3')
  })
})
