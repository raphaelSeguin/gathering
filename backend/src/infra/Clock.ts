import { Clock } from "../application/ports/Clock.js";

export class FixedClock implements Clock {
  constructor(private readonly date: Date) { }
  now(): Date {
    return this.date
  }
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
