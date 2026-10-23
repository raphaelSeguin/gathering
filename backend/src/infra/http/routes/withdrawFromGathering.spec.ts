import { beforeEach, describe, expect, test } from "vitest"
import { FastifyInstance } from "fastify"
import { Gathering } from "../../../domain/Gathering.js"
import { FixedClock } from "../../Clock.js"
import { UUIDGenerator } from "../../IdGenerator.js"
import { InMemoryGatheringRepository } from "../../persistence/GatheringRepositoryInMemory.js"
import { buildApp } from "../app.js"

describe("DELETE /api/gatherings/:id/registrations", () => {
  const NOW = new Date("2026-01-01T00:00:00.000Z")
  let app: FastifyInstance

  beforeEach(async () => {
    const repository = new InMemoryGatheringRepository()
    await repository.save(Gathering.schedule({
      id: "1234",
      title: "A new gathering",
      description: "Test gathering",
      date: new Date("2026-02-02T18:00:00.000Z"),
      capacity: 2,
      organizerId: "SAM"
    }, NOW))
    app = buildApp({ repository, idGenerator: new UUIDGenerator(), clock: new FixedClock(NOW) })
  })

  const register = (userId: string, id = "1234") =>
    app.inject({
      method: "POST",
      url: `/api/gatherings/${id}/registrations`,
      headers: { "x-user-id": userId }
    })

  const withdraw = (userId: string, id = "1234") =>
    app.inject({
      method: "DELETE",
      url: `/api/gatherings/${id}/registrations`,
      headers: userId ? { "x-user-id": userId } : {}
    })

  test("withdraws a registered participant", async () => {
    await register("ALICE")

    const response = await withdraw("ALICE")

    expect(response.statusCode).toStrictEqual(204)
    const details = await app.inject({
      method: "GET",
      url: "/api/gatherings/1234",
      headers: { "x-user-id": "ALICE" }
    })
    expect(details.json()).toMatchObject({ myStatus: "unregistered", participantCount: 0 })
  })

  test("responds 401 without a current user", async () => {
    const response = await withdraw("")

    expect(response.statusCode).toStrictEqual(401)
  })
})
