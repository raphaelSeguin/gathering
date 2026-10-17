export type CreationData = {
  readonly capacity: number;
  readonly date: Date;
}

export class Event {
  private readonly capacity: number
  private readonly date: Date

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
