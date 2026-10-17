import { useSession } from '@/composables/useSession'

const BASE_URL = '/api'

type HttpMethod = 'GET' | 'POST' | 'PATCH'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  const userId = useSession().getUserId()
  if (userId) {
    headers.set('X-User-Id', userId)
  }
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Request failed (${response.status})`, response.status)
  }
  return payload as T
}
