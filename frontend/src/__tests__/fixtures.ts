import type { GatheringDto } from '@/api/types'

export function aGathering(overrides: Partial<GatheringDto> = {}): GatheringDto {
  return {
    id: '1',
    title: 'Vue meetup',
    description: 'Talks about Vue',
    date: '2027-01-01T18:00:00.000Z',
    capacity: 10,
    participantCount: 0,
    organizerId: 'bob',
    myStatus: 'unregistered',
    ...overrides,
  }
}
