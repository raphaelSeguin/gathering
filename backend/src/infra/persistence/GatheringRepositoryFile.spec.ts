import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Gathering } from "../../domain/Gathering.js"
import { FileGatheringRepository } from "./GatheringRepositoryFile.js"

describe("FileGatheringRepository", () => {
  let directory: string
  let filePath: string

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "gatherings-"))
    filePath = join(directory, "gatherings.json")
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  test("finds nothing when the file does not exist", async () => {
    const repository = new FileGatheringRepository(filePath)

    expect(await repository.findById("1234")).toBeUndefined()
    expect(await repository.findAll()).toStrictEqual([])
  })

  test("finds a saved gathering from another instance", async () => {
    await new FileGatheringRepository(filePath).save(gathering("1234", ["ALICE", "BOB", "CHLOE"]))

    const found = await new FileGatheringRepository(filePath).findById("1234")

    expect(found?.getTitle()).toStrictEqual("A new gathering")
    expect(found?.getDescription()).toStrictEqual("Test gathering")
    expect(found?.getDate()).toStrictEqual(new Date("2026-02-02T18:00:00.000Z"))
    expect(found?.getCapacity()).toStrictEqual(2)
    expect(found?.getOrganizerId()).toStrictEqual("SAM")
    expect(found?.getParticipants()).toStrictEqual(["ALICE", "BOB", "CHLOE"])
    expect(found?.getWaitlist()).toStrictEqual(["CHLOE"])
  })

  test("finds all saved gatherings", async () => {
    const repository = new FileGatheringRepository(filePath)
    await repository.save(gathering("1234"))
    await repository.save(gathering("5678"))

    const ids = (await repository.findAll()).map((g) => g.getId())

    expect(ids).toStrictEqual(["1234", "5678"])
  })

  test("replaces a gathering saved again", async () => {
    const repository = new FileGatheringRepository(filePath)
    await repository.save(gathering("1234"))
    await repository.save(gathering("5678"))
    const changed = await repository.findById("1234")
    changed!.register("ALICE", new Date("2026-01-01T00:00:00.000Z"))

    await repository.save(changed!)

    const all = await repository.findAll()
    expect(all.map((g) => g.getId())).toStrictEqual(["1234", "5678"])
    expect(all[0]?.getParticipants()).toStrictEqual(["ALICE"])
  })

  test("writes a formatted json file", async () => {
    await new FileGatheringRepository(filePath).save(gathering("1234", ["ALICE"]))

    const content = await readFile(filePath, "utf8")

    expect(content).toStrictEqual(`[
  {
    "id": "1234",
    "title": "A new gathering",
    "description": "Test gathering",
    "date": "2026-02-02T18:00:00.000Z",
    "capacity": 2,
    "organizerId": "SAM",
    "participants": [
      "ALICE"
    ]
  }
]
`)
  })
})

function gathering(id: string, participantsIds: string[] = []): Gathering {
  return Gathering.reconstitue({
    id,
    title: "A new gathering",
    description: "Test gathering",
    date: new Date("2026-02-02T18:00:00.000Z"),
    capacity: 2,
    organizerId: "SAM",
    participantsIds
  })
}
