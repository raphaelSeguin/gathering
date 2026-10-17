import { describe, expect, test, beforeEach } from "vitest"
import { CreationData as EventCreationData, Gathering, InvalidDateError, InvalidCapacityError, MultipleRegistrationError, RegistrationError } from './Event.js'

describe("Event", () => {

  const NOW = new Date("2026-01-01")
  const PAST = new Date("2022-03-11")
  const FUTURE = new Date("2026-02-02")

  describe("Creation", () => {

    test("Event capacity can't be negative", () => {
      const creationData = {
        capacity: -1,
        date: FUTURE
      }
      const createEvent = () => new Gathering(creationData, NOW)
      expect(createEvent).toThrow(InvalidCapacityError)
    })
    test("Event must be created in the future", () => {
      const creationData: EventCreationData = {
        capacity: 10,
        date: PAST
      }
      const createEvent = () => new Gathering(creationData, NOW)
      expect(createEvent).toThrow(InvalidDateError)
    })
  })

  describe("Registration", () => {
    let event: Gathering
    let now: Date

    beforeEach(() => {
      const creationData: EventCreationData = {
        capacity: 2,
        date: new Date("2022-03-15")
      }
      now = new Date("2020-12-31")
      event = new Gathering(creationData, now)
    })

    test("Registration is confirmed if capacity is not exceeded", () => {
      event.register("ALICE")
      expect(event.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
    })

    test("Registration is waitlisted if capacity is exceeded", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      expect(event.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
      expect(event.getParticipantStatus("BOB")).toStrictEqual("confirmed")
      expect(event.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
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
      expect(event.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
      event.withdraw("ALICE")
      expect(event.getParticipantStatus("CHLOE")).toStrictEqual("confirmed")
    })

    test("A waitlisted participant's withdrawal doesn't change donfirmed participants", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      expect(event.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
      event.withdraw("CHLOE")
      expect(event.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
      expect(event.getParticipantStatus("BOB")).toStrictEqual("confirmed")
    })

    test("After withdrawal a participant becomes unregistered", () => {
      event.register("CHLOE")
      expect(event.getParticipantStatus("CHLOE")).toStrictEqual("confirmed")
      event.withdraw("CHLOE")
      expect(event.getParticipantStatus("BOB")).toStrictEqual("unregistered")
    })

    test("A participant can't withdraw from an event they're not registered to", () => {
      const unexpectedWithdrawal = () => event.withdraw("ALICE")
      expect(unexpectedWithdrawal).toThrow(RegistrationError)
    })

    test("One can't withdraw from a past event", () => {
      const unexpectedWithdrawal = () => event.withdraw("ALICE")
      expect(unexpectedWithdrawal).toThrow(RegistrationError)
    })

    test("Once a participant is registered, an event is emitted", () => {
      event.register("ALICE")
      expect(event.pullDomainEvents()).toContainEqual({
        type: "participant-registered",
        participantId: "ALICE"
      })
    })

    test("Once a participant is waitlisted, an event is emitted", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      expect(event.pullDomainEvents()).toContainEqual({
        type: "participant-waitlisted",
        participantId: "CHLOE"
      })
    })

    test("When a participant is promoted from waitlist to registered, an avent is emitted", () => {
      event.register("ALICE")
      event.register("BOB")
      event.register("CHLOE")
      event.register("DENIS")
      event.withdraw("ALICE")
      expect(event.pullDomainEvents()).toContainEqual({
        type: "participant-promoted",
        participantId: "CHLOE"
      })
    })

    describe("Modifications", () => {


      test.todo("Only the organizer can modify an event's capacity", () => {

      })

      test.todo("The capacity can only be modified to greater than number of already registered participants", () => {

      })
    })
  })
})
