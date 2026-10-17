import { Capacity } from "./Capacity.js";
import { AggragateRoot } from "./shared/AggregateRoot.js";

export type CreationData = {
  readonly capacity: number;
  readonly date: Date;
  readonly organizerId: string;
}

export type ParticipantId = string;
export type RegistrationStatus = "unregistered" | "confirmed" | "waitlisted"

export type GatheringEvent =
  | { type: "participant-registered", participantId: ParticipantId }
  | { type: "participant-waitlisted", participantId: ParticipantId }
  | { type: "participant-promoted", participantId: ParticipantId }


export class Gathering extends AggragateRoot<GatheringEvent> {
  private capacity: Capacity
  private readonly date: Date
  private readonly organizerId: string
  private readonly participants: Array<ParticipantId> = []

  constructor({ capacity,
    date,
    organizerId,
    id,
    description,
    title
  }: CreationData,
    now: Date
  ) {
    super()
    if (date <= now) {
      throw new InvalidDateError(date)
    }
    this.capacity = new Capacity(capacity)
    this.date = date
    this.organizerId = organizerId
  }

  getCapacity(): number {
    return this.capacity.getValue()
  }

  getDate(): Date {
    return this.date
  }

  register(participantId: ParticipantId) {
    if (this.participants.includes(participantId)) {
      throw new MultipleRegistrationError(participantId)
    }
    const eventType: GatheringEvent["type"] = this.participants.length < this.capacity
      ? "participant-registered"
      : "participant-waitlisted"
    this.record({
      type: eventType,
      participantId
    })
    this.participants.push(participantId)
  }

  getParticipantStatus(participantId: ParticipantId): RegistrationStatus {
    const rank = this.findParticipantRank(participantId)
    if (rank === -1) {
      return "unregistered"
    }
    return rank < this.capacity.getValue()
      ? "confirmed"
      : "waitlisted"
  }

  withdraw(participantId: ParticipantId): void {
    const rank = this.findParticipantRank(participantId)
    if (rank === -1) {
      throw new RegistrationError(`Participant ${participantId} is not registered`)
    }
    this.participants.splice(rank, 1)
    const promoted = this.participants.at(this.capacity.getValue() - 1)
    if (promoted) {
      this.record({
        type: "participant-promoted",
        participantId: promoted
      })
    }
  }

  changeCapacity(changedCapacity: number, userId: string) {
    if (userId !== this.organizerId) {
      throw new UnauthorizedCapacityModification()
    }
    if (changedCapacity < this.participants.length) {
      throw new InvalidCapacityModificationError(this.participants.length)
    }
    this.capacity = new Capacity(changedCapacity)
  }

  private findParticipantRank(participantId: ParticipantId): number {
    return this.participants.findIndex((pId) => pId === participantId)
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

export class UnauthorizedCapacityModification extends Error {
  constructor() {
    super(`Only the organizer can change capacity`)
    this.name = "UnauthorizedCapacityModification"
  }
}

export class InvalidCapacityModificationError extends Error {
  constructor(participantsCount: number) {
    super(`Capacity must be at least the number of participants (${participantsCount})`)
    this.name = "InvalidCapacityCreationError"
  }
}
