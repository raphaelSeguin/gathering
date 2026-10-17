import { describe, expect, test } from "vitest"
import { CreationData as EventCreationData, Event, InvalidDateError, InvalidCapacityError } from './Event.js'

describe("Event", () => {
  test("Event capacity can't be negative", () => {
    const creationData = {
      capacity: -1,
      date: new Date("2026-02-02")
    }
    const createEvent = () => new Event(creationData, new Date("2026-01-01"))
    expect(createEvent).toThrow(InvalidCapacityError)
  })
  test("Event must be created in the future", () => {
    const now = new Date("2022-03-12")
    const creationData: EventCreationData = {
      capacity: 10,
      date: new Date("2022-03-11")
    }
    const createEvent = () => new Event(creationData, now)
    expect(createEvent).toThrow(InvalidDateError)
  })
})
