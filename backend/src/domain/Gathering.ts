import { Capacity } from "./Capacity.js";
import { AggragateRoot } from "./shared/AggregateRoot.js";

export type CreationData = {
  readonly capacity: number;
  readonly date: Date;
  readonly organizerId: string;
  readonly id: string;
  readonly description: string;
  readonly title: string;
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
  private readonly id: string
  private description: string
  private title: string

  private constructor({ capacity,
    date,
    organizerId,
    id,
    description,
    title
  }: CreationData) {
    super()
    this.capacity = new Capacity(capacity)
    this.date = date
    this.organizerId = organizerId
    this.id = id
    this.description = description
    this.title = title
  }

  static schedule(creationData: CreationData, now: Date) {
    if (creationData.date <= now) {
      throw new InvalidDateError(creationData.date)
    }
    return new Gathering(creationData)
  }

  static reconstitue(creationData: CreationData) {
    return new Gathering(creationData)
  }

  getCapacity(): number {
    return this.capacity.getValue()
  }

  getDate(): Date {
    return this.date
  }

  getOrganizerId(): string {
    return this.organizerId
  }

  getId(): string {
    return this.id
  }

  getDescription(): string {
    return this.description
  }

  getTitle(): string {
    return this.title
  }

  getParticipants(): string[] {
    return this.participants.slice(0, this.capacity.getValue())
  }

  getWaitlist(): string[] {
    return this.participants.slice(this.capacity.getValue())
  }

  register(participantId: ParticipantId, now: Date) {
    if (this.participants.includes(participantId)) {
      throw new MultipleRegistrationError(participantId)
    }
    if (now > this.date) {
      throw new LateRegistrationError()
    }
    const eventType: GatheringEvent["type"] = this.participants.length < this.capacity.getValue()
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

  withdraw(participantId: ParticipantId, now: Date): void {
    const rank = this.findParticipantRank(participantId)
    if (rank === -1) {
      throw new RegistrationError(`Participant ${participantId} is not registered`)
    }
    if (now > this.date) {
      throw new LateWithdrawalError()
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

  changeTitle(changedTitle: string, userId: string) {
    if (userId !== this.organizerId) {
      throw new UnauthorizedTitleModification()
    }
    this.title = changedTitle
  }

  changeDescription(changedDesscription: string, userId: string) {
    if (userId !== this.organizerId) {
      throw new UnauthorizedDescriptionModification()
    }
    this.description = changedDesscription
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

export class LateRegistrationError extends Error {
  constructor() {
    super(`Registration must happen before the gathering`)
    this.name = "LateRegistrationError"
  }
}

export class LateWithdrawalError extends Error {
  constructor() {
    super(`Withdrawal must happen before the gathering`)
    this.name = "LateWithdrawalError"
  }
}

export class UnauthorizedCapacityModification extends Error {
  constructor() {
    super(`Only the organizer can change capacity`)
    this.name = "UnauthorizedCapacityModification"
  }
}

export class UnauthorizedDescriptionModification extends Error {
  constructor() {
    super(`Only the organizer can change description`)
    this.name = "UnauthorizedDescriptionModification"
  }
}


export class UnauthorizedTitleModification extends Error {
  constructor() {
    super(`Only the organizer can change title`)
    this.name = "UnauthorizedTitleModification"
  }
}

export class InvalidCapacityModificationError extends Error {
  constructor(participantsCount: number) {
    super(`Capacity must be at least the number of participants (${participantsCount})`)
    this.name = "InvalidCapacityCreationError"
  }
}
