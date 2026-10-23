import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
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
})
