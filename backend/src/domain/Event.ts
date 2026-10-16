export class Event {
  constructor(private readonly capacity: number) {
    if (capacity <= 0) {
      throw new Error("Event capacity can't be negative or null")
    }
  }
  getCapacity(): number {
    return this.capacity
  }
}
