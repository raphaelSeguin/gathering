import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGatheringsApi } from '../useGatheringsApi'
import { request } from '@/api/client'

vi.mock('@/api/client', () => ({ request: vi.fn<typeof request>() }))

describe('useGatheringsApi', () => {
  const requestMock = vi.mocked(request)

  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({})
  })

  it('lists gatherings', async () => {
    requestMock.mockResolvedValue([{ id: '1' }])

    const result = await useGatheringsApi().list()

    expect(requestMock).toHaveBeenCalledWith('GET', '/gatherings')
    expect(result).toEqual([{ id: '1' }])
  })

  it('gets one gathering', async () => {
    await useGatheringsApi().get('42')

    expect(requestMock).toHaveBeenCalledWith('GET', '/gatherings/42')
  })

  it('creates a gathering', async () => {
    const payload = { title: 'T', description: 'D', date: '2027-01-01T18:00:00.000Z', capacity: 10 }

    await useGatheringsApi().create(payload)

    expect(requestMock).toHaveBeenCalledWith('POST', '/gatherings', payload)
  })

  it('updates the capacity of a gathering', async () => {
    await useGatheringsApi().updateCapacity('42', 20)

    expect(requestMock).toHaveBeenCalledWith('PATCH', '/gatherings/42', { capacity: 20 })
  })

  it('registers to a gathering and returns the status', async () => {
    requestMock.mockResolvedValue({ status: 'waitlisted' })

    const result = await useGatheringsApi().register('42')

    expect(requestMock).toHaveBeenCalledWith('POST', '/gatherings/42/registrations')
    expect(result).toEqual({ status: 'waitlisted' })
  })

  it('withdraws from a gathering', async () => {
    await useGatheringsApi().withdraw('42')

    expect(requestMock).toHaveBeenCalledWith('DELETE', '/gatherings/42/registrations')
  })
})
