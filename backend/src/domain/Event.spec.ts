import { describe, expect, test } from "vitest"
import { Event } from './Event.js'

describe("Event", () => {
  test("Event capacity can't be negative", () => {
    const createEvent = () => new Event(-1)
    expect(createEvent).toThrow()
  })
})
