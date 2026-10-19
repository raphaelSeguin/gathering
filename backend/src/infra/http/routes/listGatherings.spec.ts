import { beforeEach, describe, expect, test } from "vitest"
import { FastifyInstance } from "fastify"
import { CreationData, Gathering } from "../../../domain/Gathering.js"
import { FixedClock } from "../../Clock.js"
import { UUIDGenerator } from "../../IdGenerator.js"
import { InMemoryGatheringRepository } from "../../persistence/GatheringRepositoryInMemory.js"
import { buildApp } from "../app.js"

describe("GET /api/gatherings", () => {
  const NOW = new Date("2026-01-01T00:00:00.000Z")
  const creationData: CreationData = {
    id: "1234",
    title: "A new gathering",
    description: "Test gathering",
    date: new Date("2026-02-02T18:00:00.000Z"),
    capacity: 2,
    organizerId: "SAM"
  }
  let app: FastifyInstance

  beforeEach(async () => {
    const repository = new InMemoryGatheringRepository()
    const registered = Gathering.schedule(creationData, NOW)
    registered.register("ALICE", NOW)
    await repository.save(registered)
    await repository.save(Gathering.schedule({ ...creationData, id: "5678", title: "Another gathering" }, NOW))
    app = buildApp({ repository, idGenerator: new UUIDGenerator(), clock: new FixedClock(NOW) })
  })

  test("lists every gathering with the status of the current user", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/gatherings",
      headers: { "x-user-id": "ALICE" }
    })

    expect(response.statusCode).toStrictEqual(200)
    expect(response.json()).toMatchObject([
      { id: "1234", title: "A new gathering", participantCount: 1, myStatus: "confirmed" },
      { id: "5678", title: "Another gathering", participantCount: 0, myStatus: "unregistered" }
    ])
  })
})
