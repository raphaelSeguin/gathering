import { describe, it, expect, beforeEach } from 'vitest'
import { useSession } from '../useSession'

describe('useSession', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns null when no user is stored', () => {
    expect(useSession().getUserId()).toBeNull()
  })

  it('stores and reads the user id', () => {
    useSession().setUserId('alice')

    expect(useSession().getUserId()).toBe('alice')
  })

  it('clears the user id', () => {
    useSession().setUserId('alice')

    useSession().clear()

    expect(useSession().getUserId()).toBeNull()
  })
})
