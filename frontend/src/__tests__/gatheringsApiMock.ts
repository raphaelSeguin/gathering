import { vi } from 'vitest'
import type { useGatheringsApi as realUseGatheringsApi } from '@/composables/useGatheringsApi'

type GatheringsApi = ReturnType<typeof realUseGatheringsApi>

/** Module replacement for `@/composables/useGatheringsApi`:
 *  `vi.mock('@/composables/useGatheringsApi', () => import('@/__tests__/gatheringsApiMock'))` */
const api = {
  list: vi.fn<GatheringsApi['list']>(),
  get: vi.fn<GatheringsApi['get']>(),
  create: vi.fn<GatheringsApi['create']>(),
  updateCapacity: vi.fn<GatheringsApi['updateCapacity']>(),
  register: vi.fn<GatheringsApi['register']>(),
}

export const useGatheringsApi = () => api
