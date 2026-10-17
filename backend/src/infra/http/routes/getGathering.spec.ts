import { beforeEach, describe, expect, test } from "vitest"
import { FastifyInstance } from "fastify"
import { Gathering } from "../../../domain/Gathering.js"
import { FixedClock } from "../../Clock.js"
import { UUIDGenerator } from "../../IdGenerator.js"
import { InMemoryGatheringRepository } from "../../persistence/GatheringRepositoryInMemory.js"
import { buildApp } from "../app.js"

describe("GET /api/gatherings/:id", () => {
  const NOW = new Date("2026-01-01T00:00:00.000Z")
  let app: FastifyInstance

  beforeEach(async () => {
    const repository = new InMemoryGatheringRepository()
    const gathering = new Gathering({
      id: "1234",
      title: "A new gathering",
      description: "Test gathering",
      date: new Date("2026-02-02T18:00:00.000Z"),
      capacity: 2,
      organizerId: "SAM"
    }, NOW)
    gathering.register("ALICE", NOW)
    gathering.register("BOB", NOW)
    gathering.register("CHLOE", NOW)
    await repository.save(gathering)
    app = buildApp({ repository, idGenerator: new UUIDGenerator(), clock: new FixedClock(NOW) })
  })

  test("returns the gathering", async () => {
    const response = await app.inject({ method: "GET", url: "/api/gatherings/1234" })

    expect(response.statusCode).toStrictEqual(200)
    expect(response.json()).toStrictEqual({
      id: "1234",
      title: "A new gathering",
      description: "Test gathering",
      date: "2026-02-02T18:00:00.000Z",
      capacity: 2,
      participantCount: 2,
      waitlist: ["CHLOE"],
      organizerId: "SAM",
      myStatus: "unregistered"
    })
  })

  test("returns the status of the current user", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/gatherings/1234",
      headers: { "x-user-id": "CHLOE" }
    })

    expect(response.json().myStatus).toStrictEqual("waitlisted")
  })

  test("responds 404 for an unknown gathering", async () => {
    const response = await app.inject({ method: "GET", url: "/api/gatherings/unknown" })

    expect(response.statusCode).toStrictEqual(404)
    expect(response.json()).toStrictEqual({ message: "Gathering unknown not found" })
  })
})
