import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGatheringsStore } from '../gatherings'
import { useSessionStore } from '../session'
import { aGathering } from '@/__tests__/fixtures'

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
