import { describe, expect, test, beforeEach } from "vitest"
import { CreationData as EventCreationData, Event, InvalidDateError, InvalidCapacityError, MultipleRegistrationError } from './Event.js'

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

  describe("Registration", () => {
    let event: Event
    let now: Date

    beforeEach(() => {
      const creationData: EventCreationData = {
        capacity: 2,
        date: new Date("2022-03-15")
      }
      now = new Date("2020-12-31")
      event = new Event(creationData, now)
    })

    test("Registration is confirmed if capacity is not exceeded", () => {
      event.register("ALICE")
      expect(event.getUserStatus("ALICE")).toStrictEqual("confirmed")
    })

    test("Registration is waitlisted if capacity is exceeded", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      expect(event.getUserStatus("ALICE")).toStrictEqual("confirmed")
      expect(event.getUserStatus("BOB")).toStrictEqual("confirmed")
      expect(event.getUserStatus("CHLOE")).toStrictEqual("waitlisted")
    })

    test("A participant can't register twice", () => {
      event.register("ALICE")
      const doubleRegistration = () => event.register("ALICE")
      expect(doubleRegistration).toThrow(MultipleRegistrationError)
    })

    test("A confirmed participant's withdrawal promotes the first one on the wait list", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      expect(event.getUserStatus("CHLOE")).toStrictEqual("waitlisted")
      event.withdraw("ALICE")
      expect(event.getUserStatus("CHLOE")).toStrictEqual("confirmed")
    })

    test("A waitlisted participant's withdrawal doesn't change donfirmed participants", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      expect(event.getUserStatus("CHLOE")).toStrictEqual("waitlisted")
      event.withdraw("CHLOE")
      expect(event.getUserStatus("ALICE")).toStrictEqual("confirmed")
      expect(event.getUserStatus("BOB")).toStrictEqual("confirmed")
    })

    test("After withdrawal a participant becomes unregistered", () => {
      event.register("CHLOE")
      expect(event.getUserStatus("CHLOE")).toStrictEqual("confirmed")
      event.withdraw("CHLOE")
      expect(event.getUserStatus("BOB")).toStrictEqual("unregistered")
    })
  })
})
