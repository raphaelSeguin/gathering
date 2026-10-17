import { describe, it, expect } from 'vitest'
import { toDateTimeLocal } from '../dateTimeLocal'

describe('toDateTimeLocal', () => {
  it('formats an ISO date as a local datetime-local value', () => {
    const iso = new Date(2027, 0, 5, 8, 7).toISOString()

    expect(toDateTimeLocal(iso)).toBe('2027-01-05T08:07')
  })
})
