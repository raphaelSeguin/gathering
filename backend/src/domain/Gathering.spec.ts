import { describe, expect, test, beforeEach } from "vitest"
import { CreationData as GatheringCreationData, Gathering, InvalidDateError, MultipleRegistrationError, RegistrationError, UnauthorizedCapacityModification, InvalidCapacityModificationError, UnauthorizedTitleModification, UnauthorizedDescriptionModification } from './Gathering.js'
import { InvalidCapacityCreationError } from "./Capacity.js"

describe("Gathering", () => {

  const NOW = new Date("2026-01-01")
  const PAST = new Date("2022-03-11")
  const FUTURE = new Date("2026-02-02")

  const defaultCreationData = {
    title: "A new gathering",
    description: "Test gathering",
    id: "1234"
  }
  describe("Creation", () => {

    test("Gathering capacity can't be less than two", () => {
      const creationData = {
        capacity: -1,
        date: FUTURE,
        organizerId: "SAM",
        ...defaultCreationData

      }
      expect((() => new Gathering(creationData, NOW)))
        .toThrow(InvalidCapacityCreationError)
    })
    test("Gathering must be created in the future", () => {
      const creationData: GatheringCreationData = {
        capacity: 10,
        date: PAST,
        organizerId: "SAM",
        ...defaultCreationData
      }
      expect((() => new Gathering(creationData, NOW)))
        .toThrow(InvalidDateError)
    })
    test("Gathering exposes its organizer", () => {
      const gathering = new Gathering({
        capacity: 10,
        date: FUTURE,
        organizerId: "SAM",
        ...defaultCreationData
      }, NOW)
      expect(gathering.getOrganizerId()).toStrictEqual("SAM")
    })
  })

  describe("Registration", () => {
    let gathering: Gathering
    let now: Date

    beforeEach(() => {
      now = NOW
      const creationData: GatheringCreationData = {
        capacity: 2,
        date: FUTURE,
        organizerId: "SAM",
        ...defaultCreationData
      }
      gathering = new Gathering(creationData, NOW)
    })

    test("Registration is confirmed if capacity is not exceeded", () => {
      gathering.register("ALICE", NOW)
      expect(gathering.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
    })

    test("Registration is waitlisted if capacity is exceeded", () => {
      gathering.register("ALICE", NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      expect(gathering.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
      expect(gathering.getParticipantStatus("BOB")).toStrictEqual("confirmed")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
    })

    test("Participants are the confirmed ones, the waitlist keeps the others in order", () => {
      gathering.register("ALICE", NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      gathering.register("DENIS", NOW)
      expect(gathering.getParticipants()).toStrictEqual(["ALICE", "BOB"])
      expect(gathering.getWaitlist()).toStrictEqual(["CHLOE", "DENIS"])
    })

    test("A participant can't register twice", () => {
      gathering.register("ALICE", NOW)
      const doubleRegistration = () => gathering.register("ALICE", NOW)
      expect(doubleRegistration).toThrow(MultipleRegistrationError)
    })

    test("A confirmed participant's withdrawal promotes the first one on the wait list", () => {
      gathering.register("ALICE", NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
      gathering.withdraw("ALICE")
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("confirmed")
    })

    test("A waitlisted participant's withdrawal doesn't change donfirmed participants", () => {
      gathering.register("ALICE", NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      expect(gathering.getParticipantStatus("CHLOE")).toStrictEqual("waitlisted")
      gathering.withdraw("CHLOE")
      expect(gathering.getParticipantStatus("ALICE")).toStrictEqual("confirmed")
      expect(gathering.getParticipantStatus("BOB")).toStrictEqual("confirmed")
    })

    test("After withdrawal a participant becomes unregistered", () => {
      gathering.register("CHLOE", NOW)
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
      gathering.register("ALICE", NOW)
      expect(gathering.pullDomainEvents()).toContainEqual({
        type: "participant-registered",
        participantId: "ALICE"
      })
    })

    test("Once a participant is waitlisted, an event is emitted", () => {
      gathering.register("ALICE", NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      expect(gathering.pullDomainEvents()).toContainEqual({
        type: "participant-waitlisted",
        participantId: "CHLOE"
      })
    })

    test("When a participant is promoted from waitlist to registered, an avent is emitted", () => {
      gathering.register("ALICE", NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      gathering.register("DENIS", NOW)
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
        organizerId: "ALICE",
        ...defaultCreationData
      }, NOW)
      gathering.changeCapacity(200, "ALICE")
      expect(gathering.getCapacity()).toStrictEqual(200)

    })

    test("Only the organizer can modify a gathering capacity", () => {
      const capacity = 50
      const gathering = new Gathering({
        date: FUTURE,
        capacity: capacity,
        organizerId: "ALICE",
        ...defaultCreationData
      }, NOW)
      const changeCapacity = () => gathering.changeCapacity(200, "BOB")
      expect(changeCapacity).toThrow(UnauthorizedCapacityModification)
      expect(gathering.getCapacity()).toStrictEqual(capacity)
    })

    test("Only the organizer can modify a gathering title", () => {
      const capacity = 50
      const gathering = new Gathering({
        date: FUTURE,
        capacity: capacity,
        organizerId: "ALICE",
        ...defaultCreationData
      }, NOW)
      const changeCapacity = () => gathering.changeTitle("Réunion", "BOB")
      expect(changeCapacity).toThrow(UnauthorizedTitleModification)
      expect(gathering.getTitle()).toStrictEqual(defaultCreationData.title)
    })

    test("Only the organizer can modify a gathering description", () => {
      const capacity = 50
      const gathering = new Gathering({
        date: FUTURE,
        capacity: capacity,
        organizerId: "ALICE",
        ...defaultCreationData
      }, NOW)
      const changeCapacity = () => gathering.changeDescription("autre description", "BOB")
      expect(changeCapacity).toThrow(UnauthorizedDescriptionModification)
      expect(gathering.getDescription()).toStrictEqual(defaultCreationData.description)
    })

    test("The capacity can only be modified to at least the number of already registered participants", () => {
      const capacity = 50
      const gathering = new Gathering({
        date: FUTURE,
        capacity: capacity,
        organizerId: "ALICE",
        ...defaultCreationData
      }, NOW)
      gathering.register("BOB", NOW)
      gathering.register("CHLOE", NOW)
      const changeCapacity = () => gathering.changeCapacity(1, "ALICE")
      expect(changeCapacity).toThrow(InvalidCapacityModificationError)
      expect(gathering.getCapacity()).toStrictEqual(capacity)
    })
  })
})
