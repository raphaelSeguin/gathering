export type RegistrationStatus = 'unregistered' | 'confirmed' | 'waitlisted'

export type GatheringDto = {
  id: string
  title: string
  description: string
  date: string
  capacity: number
  participantCount: number
  organizerId: string
  myStatus: RegistrationStatus
}

export type GatheringCreationPayload = {
  title: string
  description: string
  date: string
  capacity: number
}

export type RegistrationResult = {
  status: Exclude<RegistrationStatus, 'unregistered'>
}
