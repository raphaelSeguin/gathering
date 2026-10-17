import { describe, expect, test, beforeEach } from "vitest"
import { CreationData as GatheringCreationData, Gathering, InvalidDateError, InvalidCapacityCreationError, MultipleRegistrationError, RegistrationError, UnauthorizedCapacityModification, InvalidCapacityModificationError } from './Gathering.js'

describe("Gathering", () => {

  const NOW = new Date("2026-01-01")
  const PAST = new Date("2022-03-11")
  const FUTURE = new Date("2026-02-02")

  describe("Creation", () => {

    test("Gathering capacity can't be negative", () => {
      const creationData = {
        capacity: -1,
        date: FUTURE,
        organizerId: "SAM"
      }
      expect((() => new Gathering(creationData, NOW)))
        .toThrow(InvalidCapacityCreationError)
    })
    test("Gathering must be created in the future", () => {
      const creationData: GatheringCreationData = {
        capacity: 10,
        date: PAST,
        organizerId: "SAM"
      }
      expect((() => new Gathering(creationData, NOW)))
        .toThrow(InvalidDateError)
    })
  })

  describe("Registration", () => {
    let gathering: Gathering
    let now: Date

    beforeEach(() => {
      const creationData: GatheringCreationData = {
        capacity: 2,
        date: new Date("2022-03-15"),
        organizerId: "SAM"
      }
      now = new Date("2020-12-31")
      gathering = new Gathering(creationData, now)
    })

    test("Registration is confirmed if capacity is not exceeded", () => {
      gathering.register("ALICE")
      expect(gathering.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
    })

    test("Registration is waitlisted if capacity is exceeded", () => {
      gathering.register("ALICE")
      gathering.register("BOB")
      gathering.register("CHLOE")
      expect(gathering.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
      expect(gathering.getParticipantStatus("BOB")).toStrictEqual("confirmed")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
    })

    test("A participant can't register twice", () => {
      gathering.register("ALICE")
      const doubleRegistration = () => gathering.register("ALICE")
      expect(doubleRegistration).toThrow(MultipleRegistrationError)
    })

    test("A confirmed participant's withdrawal promotes the first one on the wait list", () => {
      gathering.register("ALICE")
      gathering.register("BOB")
      gathering.register("CHLOE")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
      gathering.withdraw("ALICE")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("confirmed")
    })

    test("A waitlisted participant's withdrawal doesn't change donfirmed participants", () => {
      gathering.register("ALICE")
      gathering.register("BOB")
      gathering.register("CHLOE")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
      gathering.withdraw("CHLOE")
      expect(gathering.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
      expect(gathering.getParticipantStatus("BOB")).toStrictEqual("confirmed")
    })

    test("After withdrawal a participant becomes unregistered", () => {
      gathering.register("CHLOE")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("confirmed")
      gathering.withdraw("CHLOE")
      expect(gathering.getParticipantStatus("BOB")).toStrictEqual("unregistered")
    })

    test("A participant can't withdraw from a gathering they're not registered to", () => {
      const unexpectedWithdrawal = () => gathering.withdraw("ALICE")
      expect(unexpectedWithdrawal).toThrow(RegistrationError)
    })

    test("One can't withdraw from a past gathering", () => {
      const unexpectedWithdrawal = () => gathering.withdraw("ALICE")
      expect(unexpectedWithdrawal).toThrow(RegistrationError)
    })

    test("Once a participant is registered, an event is emitted", () => {
      gathering.register("ALICE")
      expect(gathering.pullDomainEvents()).toContainEqual({
        type: "participant-registered",
        participantId: "ALICE"
      })
    })

    test("Once a participant is waitlisted, an event is emitted", () => {
      gathering.register("ALICE")
      gathering.register("BOB")
      gathering.register("CHLOE")
      expect(gathering.pullDomainEvents()).toContainEqual({
        type: "participant-waitlisted",
        participantId: "CHLOE"
      })
    })

    test("When a participant is promoted from waitlist to registered, an avent is emitted", () => {
      gathering.register("ALICE")
      gathering.register("BOB")
      gathering.register("CHLOE")
      gathering.register("DENIS")
      gathering.withdraw("ALICE")
      expect(gathering.pullDomainEvents()).toContainEqual({
        type: "participant-promoted",
        participantId: "CHLOE"
      })
    })

  })
  describe("Modification", () => {
    test("Capacity can be modified by organizer", () => {
      const gathering = new Gathering({
        date: FUTURE,
        capacity: 50,
        organizerId: "ALICE"
      }, NOW)
      gathering.changeCapacity(200, "ALICE")
      expect(gathering.getCapacity()).toStrictEqual(200)

    })

    test("Only the organizer can modify a gathering capacity", () => {
      const capacity = 50
      const gathering = new Gathering({
        date: FUTURE,
        capacity: capacity,
        organizerId: "ALICE"
      }, NOW)
      const changeCapacity = () => gathering.changeCapacity(200, "BOB")
      expect(changeCapacity).toThrow(UnauthorizedCapacityModification)
      expect(gathering.getCapacity()).toStrictEqual(capacity)
    })

    test("The capacity can only be modified to at least the number of already registered participants", () => {
      const capacity = 50
      const gathering = new Gathering({
        date: FUTURE,
        capacity: capacity,
        organizerId: "ALICE"
      }, NOW)
      gathering.register("BOB")
      gathering.register("CHLOE")
      const changeCapacity = () => gathering.changeCapacity(1, "ALICE")
      expect(changeCapacity).toThrow(InvalidCapacityModificationError)
      expect(gathering.getCapacity()).toStrictEqual(capacity)
    })
  })
})
