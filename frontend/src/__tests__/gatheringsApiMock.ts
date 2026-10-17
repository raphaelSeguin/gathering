import { vi } from 'vitest'

/** Module replacement for `@/composables/useGatheringsApi`:
 *  `vi.mock('@/composables/useGatheringsApi', () => import('@/__tests__/gatheringsApiMock'))` */
const api = {
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  updateCapacity: vi.fn(),
  register: vi.fn(),
}

export const useGatheringsApi = () => api
