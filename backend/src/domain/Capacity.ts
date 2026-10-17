export class Capacity {
  constructor(private readonly value: number) {
    if (value <= 0) {
      throw new InvalidCapacityCreationError(value)
    }
  }
  getValue() {
    return this.value
  }
}

export class InvalidCapacityCreationError extends Error {
  constructor(capacity: number) {
    super(`Event capacity can't be negative or null : ${capacity} is invalid`)
    this.name = "InvalidCapacityCreationError"
  }
}
