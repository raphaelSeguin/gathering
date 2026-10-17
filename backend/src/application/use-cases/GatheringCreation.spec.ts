import { describe, expect, test } from "vitest"
import { GatheringCreation } from "./GatheringCreation.js"
import { FixedClock } from "../../infra/Clock.js"
import { InMemoryGatheringRepository } from "../../infra/persistence/GatheringRepositoryInMemory.js"
import { UUIDGenerator } from "../../infra/IdGenerator.js"

describe("Create Gathering", () => {
  test("Creation of a Gathering", async () => {
    const repository = new InMemoryGatheringRepository()
    const dependencies = {
      repository,
      idGenerator: new UUIDGenerator(),
      clock: new FixedClock(new Date("2020-02-02"))
    }
    const gatheringCreation = new GatheringCreation(dependencies)
    const description = "A test gathering"
    const id = await gatheringCreation.execute({
      title: "New gathering",
      date: new Date("2026-06-06"),
      organizerId: "ALICE",
      description,
      capacity: 50
    })
    const savedGathering = await repository.findById(id)
    expect(savedGathering).toBeDefined()
    expect(savedGathering!.getDescription()).toStrictEqual(description)
    expect(savedGathering!.getCapacity()).toStrictEqual(50)
  })
})
