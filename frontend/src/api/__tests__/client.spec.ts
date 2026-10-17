import { describe, it, expect, beforeEach, vi } from 'vitest'
import { request, ApiError } from '../client'
import { useSession } from '@/composables/useSession'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('api client', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    sessionStorage.clear()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('prefixes the path with /api and returns the parsed JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [{ id: '1' }]))

    const result = await request('GET', '/gatherings')

    expect(fetchMock).toHaveBeenCalledWith('/api/gatherings', expect.objectContaining({ method: 'GET' }))
    expect(result).toEqual([{ id: '1' }])
  })

  it('sends the current user id in the X-User-Id header', async () => {
    useSession().setUserId('alice')
    fetchMock.mockResolvedValue(jsonResponse(200, {}))

    await request('GET', '/gatherings')

    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(new Headers(init.headers).get('X-User-Id')).toBe('alice')
  })

  it('serializes the body as JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}))

    await request('POST', '/gatherings', { capacity: 3 })

    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(init.body).toBe(JSON.stringify({ capacity: 3 }))
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
  })

  it('throws an ApiError with the server message on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { message: 'Capacity must be at least 3' }))

    const error = await request('PATCH', '/gatherings/1', { capacity: 1 }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: 'Capacity must be at least 3', status: 400 })
  })
})
