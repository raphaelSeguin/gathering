import { Gathering, RegistrationStatus } from "../../domain/Gathering.js"

export type GatheringDto = {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  participantCount: number;
  waitlist: string[];
  organizerId: string;
  myStatus: RegistrationStatus;
}

export function toGatheringDto(gathering: Gathering, userId?: string): GatheringDto {
  return {
    id: gathering.getId(),
    title: gathering.getTitle(),
    description: gathering.getDescription(),
    date: gathering.getDate().toISOString(),
    capacity: gathering.getCapacity(),
    participantCount: gathering.getParticipants().length,
    waitlist: gathering.getWaitlist(),
    organizerId: gathering.getOrganizerId(),
    myStatus: userId ? gathering.getParticipantStatus(userId) : "unregistered"
  }
}
