import { describe, it, expect } from 'vitest'
import { validateGatheringForm, type GatheringFormValues } from '../gatheringForm'

const now = new Date('2026-10-17T12:00:00')

const valid: GatheringFormValues = {
  title: 'Vue meetup',
  description: 'Talks about Vue',
  date: '2026-11-01T18:30',
  capacity: 10,
}

describe('validateGatheringForm', () => {
  it('accepts valid values', () => {
    expect(validateGatheringForm(valid, now)).toEqual({})
  })

  it('requires a title, a description and a date', () => {
    const errors = validateGatheringForm({ ...valid, title: '  ', description: '', date: '' }, now)

    expect(errors).toEqual({
      title: 'Title is required',
      description: 'Description is required',
      date: 'Date is required',
    })
  })

  it('rejects a date in the past', () => {
    expect(validateGatheringForm({ ...valid, date: '2026-10-17T11:59' }, now)).toEqual({
      date: 'Date must be in the future',
    })
  })

  it.each([null, 0, -1, 2.5])('rejects capacity %s', (capacity) => {
    expect(validateGatheringForm({ ...valid, capacity }, now)).toEqual({
      capacity: 'Capacity must be a whole number of at least 1',
    })
  })
})
