import { request } from '@/api/client'
import type { GatheringCreationPayload, GatheringDto, RegistrationResult } from '@/api/types'

export function useGatheringsApi() {
  return {
    list: () => request<GatheringDto[]>('GET', '/gatherings'),
    get: (id: string) => request<GatheringDto>('GET', `/gatherings/${id}`),
    create: (payload: GatheringCreationPayload) =>
      request<GatheringDto>('POST', '/gatherings', payload),
    updateCapacity: (id: string, capacity: number) =>
      request<GatheringDto>('PATCH', `/gatherings/${id}`, { capacity }),
    register: (id: string) => request<RegistrationResult>('POST', `/gatherings/${id}/registrations`),
  }
}
