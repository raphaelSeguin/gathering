import { beforeEach, describe, expect, test } from "vitest"
import { Gathering, CreationData, UnauthorizedDescriptionModification, UnauthorizedTitleModification, UnauthorizedCapacityModification } from "../../domain/Gathering.js"
import { InMemoryGatheringRepository } from "../../infra/persistence/GatheringRepositoryInMemory.js"
import { GatheringModification } from "./GatheringModification.js"
import { GatheringRepository } from "../ports/GatheringRepository.js"
import { GatheringNotFoundError } from "../errors.js"

describe("Modify Gathering", () => {
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
    gathering = new Gathering(creationData, now)
    now = new Date("2020-12-31")
    gatheringRepository = new InMemoryGatheringRepository()
    await gatheringRepository.save(gathering)

  })
  test("The organizer can change a gathering", async () => {
    const gatheringModification = new GatheringModification({ repository: gatheringRepository })
    const changedDescription = "A new description"
    const changedTitle = "A new title"
    const changedCapacity = 60

    await gatheringModification.execute({
      type: "description",
      content: changedDescription,
      userId: "SAM",
      gatheringId: "1234"
    })
    await gatheringModification.execute({
      type: "title",
      content: changedTitle,
      userId: "SAM",
      gatheringId: "1234"
    })
    await gatheringModification.execute({
      type: "capacity",
      content: changedCapacity,
      userId: "SAM",
      gatheringId: "1234"
    })

    const saved = await gatheringRepository.findById("1234")
    expect(saved?.getDescription()).toStrictEqual(changedDescription)
    expect(saved?.getTitle()).toStrictEqual(changedTitle)
    expect(saved?.getCapacity()).toStrictEqual(changedCapacity)
  })
  test("Only the organizer can change a gathering", async () => {
    const gatheringModification = new GatheringModification({ repository: gatheringRepository })
    const changedDescription = "A new description"
    const changedTitle = "A new title"
    const changedCapacity = 60

    await expect(() => gatheringModification.execute({
      type: "description",
      content: changedDescription,
      userId: "TOTO",
      gatheringId: "1234"
    })).rejects.toThrow(UnauthorizedDescriptionModification)
    await expect(() => gatheringModification.execute({
      type: "title",
      content: changedTitle,
      userId: "TOTO",
      gatheringId: "1234"
    })).rejects.toThrow(UnauthorizedTitleModification)
    await expect(() => gatheringModification.execute({
      type: "capacity",
      content: changedCapacity,
      userId: "TOTO",
      gatheringId: "1234"
    })).rejects.toThrow(UnauthorizedCapacityModification)

    const saved = await gatheringRepository.findById("1234")
    expect(saved?.getDescription()).toStrictEqual(creationData.description)
    expect(saved?.getTitle()).toStrictEqual(creationData.title)
    expect(saved?.getCapacity()).toStrictEqual(creationData.capacity)
  })

  test("Modifying an unknown gathering is rejected", async () => {
    const gatheringModification = new GatheringModification({ repository: gatheringRepository })
    await expect(() => gatheringModification.execute({
      type: "description",
      content: "A new description",
      userId: "SAM",
      gatheringId: "unknown"
    })).rejects.toThrow(GatheringNotFoundError)
  })
})
