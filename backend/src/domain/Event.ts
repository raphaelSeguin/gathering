export type CreationData = {
  readonly capacity: number;
  readonly date: Date;
}

export type ParticipantId = string;
export type RegistrationStatus = "unregistered" | "confirmed" | "waitlisted"

export class Event {
  private readonly capacity: number
  private readonly date: Date
  private readonly participants: Array<ParticipantId> = []

  constructor({ capacity, date }: CreationData, now: Date) {
    if (capacity <= 0) {
      throw new InvalidCapacityError(capacity)
    }
    if (date <= now) {
      throw new InvalidDateError(date)
    }
    this.capacity = capacity
    this.date = date
  }

  getCapacity(): number {
    return this.capacity
  }

  getDate(): Date {
    return this.date
  }

  register(participantId: ParticipantId) {
    if (this.participants.includes(participantId)) {
      throw new MultipleRegistrationError(participantId)
    }
    this.participants.push(participantId)
  }

  getUserStatus(participantId: ParticipantId): RegistrationStatus {
    const rank = this.findParticipantRank(participantId)
    if (rank === -1) {
      return "unregistered"
    }
    return rank < this.capacity
      ? "confirmed"
      : "waitlisted"
  }

  withdraw(participantId: ParticipantId): void {
    const rank = this.findParticipantRank(participantId)
    if (rank === -1) {
      throw new RegistrationError(`Participant ${participantId} is not registered`)
    }
    this.participants.splice(rank, 1)
  }

  private findParticipantRank(participantId: ParticipantId): number {
    return this.participants.findIndex((pId) => pId === participantId)
  }
}

export class InvalidCapacityError extends Error {
  constructor(capacity: number) {
    super(`Event capacity can't be negative or null : ${capacity} is invalid`)
    this.name = "InvalidCapacityError"
  }
}

export class InvalidDateError extends Error {
  constructor(date: Date) {
    super(`Event must be created in the future : ${date} is invalid`)
    this.name = "InvalidDateError"
  }
}

export class MultipleRegistrationError extends Error {
  constructor(participantId: ParticipantId) {
    super(`Registration is limited to one per participant : ${participantId} is already registered`)
    this.name = "MultipleRegistrationError"
  }
}

export class RegistrationError extends Error {
  constructor(message: string) {
    super(`${message}`)
    this.name = "RegistrationError"
  }
}
