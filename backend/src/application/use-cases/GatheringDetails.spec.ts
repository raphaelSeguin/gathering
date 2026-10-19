import { beforeEach, describe, expect, test } from "vitest"
import { CreationData, Gathering } from "../../domain/Gathering.js"
import { InMemoryGatheringRepository } from "../../infra/persistence/GatheringRepositoryInMemory.js"
import { GatheringRepository } from "../ports/GatheringRepository.js"
import { GatheringNotFoundError } from "../errors.js"
import { GatheringDetails } from "./GatheringDetails.js"

describe("Gathering details", () => {
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
    gatheringRepository = new InMemoryGatheringRepository()
    await gatheringRepository.save(Gathering.schedule(creationData, new Date("2020-12-31")))
  })

  test("Retrieving a gathering by its id", async () => {
    const gatheringDetails = new GatheringDetails({ repository: gatheringRepository })
    const gathering = await gatheringDetails.execute({ gatheringId: "1234" })
    expect(gathering.getTitle()).toStrictEqual(creationData.title)
  })

  test("Retrieving an unknown gathering is rejected", async () => {
    const gatheringDetails = new GatheringDetails({ repository: gatheringRepository })
    await expect(() => gatheringDetails.execute({ gatheringId: "unknown" }))
      .rejects.toThrow(GatheringNotFoundError)
  })
})
