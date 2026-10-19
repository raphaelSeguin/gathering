import { beforeEach, describe, expect, test } from "vitest"
import { CreationData, Gathering } from "../../domain/Gathering.js"
import { InMemoryGatheringRepository } from "../../infra/persistence/GatheringRepositoryInMemory.js"
import { GatheringRepository } from "../ports/GatheringRepository.js"
import { GatheringRegistration } from "./GatheringRegistration.js"
import { FixedClock } from "../../infra/Clock.js"
import { GatheringNotFoundError } from "../errors.js"

describe("Registration to a Gathering", () => {
  let gathering: Gathering
  let now: Date
  let gatheringRepository: GatheringRepository

  const creationData: CreationData = {
    capacity: 2,
    date: new Date("2022-03-15"),
    organizerId: "SAM",
    title: "A new gathering",
    description: "Test gathering",
    id: "1234"
  }
  beforeEach(async () => {
    gathering = Gathering.schedule(creationData, now)
    now = new Date("2020-12-31")
    gatheringRepository = new InMemoryGatheringRepository()
    await gatheringRepository.save(gathering)
  })

  test("Registering to a gathering", async () => {
    const gatheringRegistration = new GatheringRegistration({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-01"))
    })
    await gatheringRegistration.execute({
      usedId: "ALICE",
      gatheringId: "1234"
    })
    const savedGathering = await gatheringRepository.findById("1234")
    expect(savedGathering).toBeDefined()
    expect(savedGathering?.getParticipants()).toHaveLength(1)
  })

  test("Registering is impossible after the gathering date", async () => {
    const gatheringRegistration = new GatheringRegistration({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-16"))
    })
    await expect(() => gatheringRegistration.execute({
      usedId: "ALICE",
      gatheringId: "1234"
    })).rejects.toThrow()
    const savedGathering = await gatheringRepository.findById("1234")
    expect(savedGathering).toBeDefined()
    expect(savedGathering?.getParticipants()).toHaveLength(0)
  })

  test("Registering to an unknown gathering is rejected", async () => {
    const gatheringRegistration = new GatheringRegistration({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-01"))
    })
    await expect(() => gatheringRegistration.execute({
      usedId: "ALICE",
      gatheringId: "unknown"
    })).rejects.toThrow(GatheringNotFoundError)
  })

  test("Registering returns the participant status", async () => {
    const gatheringRegistration = new GatheringRegistration({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-01"))
    })
    const register = (usedId: string) => gatheringRegistration.execute({ usedId, gatheringId: "1234" })
    expect(await register("ALICE")).toStrictEqual("confirmed")
    expect(await register("BOB")).toStrictEqual("confirmed")
    expect(await register("CHLOE")).toStrictEqual("waitlisted")
  })
})
