import { describe, expect, test } from "vitest"
import { CreationData, Gathering } from "../../domain/Gathering.js"
import { InMemoryGatheringRepository } from "../../infra/persistence/GatheringRepositoryInMemory.js"
import { GatheringList } from "./GatheringList.js"

describe("Gathering list", () => {
  const creationData: CreationData = {
    capacity: 2,
    date: new Date("2022-03-15"),
    organizerId: "SAM",
    title: "A new gathering",
    description: "Test gathering",
    id: "1234"
  }

  test("Listing every gathering", async () => {
    const gatheringRepository = new InMemoryGatheringRepository()
    const now = new Date("2020-12-31")
    await gatheringRepository.save(Gathering.schedule(creationData, now))
    await gatheringRepository.save(Gathering.schedule({ ...creationData, id: "5678" }, now))

    const gatherings = await new GatheringList({ repository: gatheringRepository }).execute()

    expect(gatherings.map((gathering) => gathering.getId())).toStrictEqual(["1234", "5678"])
  })
})
