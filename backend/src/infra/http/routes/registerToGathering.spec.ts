import { beforeEach, describe, expect, test } from "vitest"
import { FastifyInstance } from "fastify"
import { Gathering } from "../../../domain/Gathering.js"
import { FixedClock } from "../../Clock.js"
import { UUIDGenerator } from "../../IdGenerator.js"
import { InMemoryGatheringRepository } from "../../persistence/GatheringRepositoryInMemory.js"
import { buildApp } from "../app.js"

describe("POST /api/gatherings/:id/registrations", () => {
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
      headers: userId ? { "x-user-id": userId } : {}
    })

  test("confirms the registration while there is room", async () => {
    const response = await register("ALICE")

    expect(response.statusCode).toStrictEqual(201)
    expect(response.json()).toStrictEqual({ status: "confirmed" })
  })

  test("waitlists the registration once the gathering is full", async () => {
    await register("ALICE")
    await register("BOB")

    const response = await register("CHLOE")

    expect(response.statusCode).toStrictEqual(201)
    expect(response.json()).toStrictEqual({ status: "waitlisted" })
  })

  test("responds 401 without a current user", async () => {
    const response = await register("")

    expect(response.statusCode).toStrictEqual(401)
  })

  test("responds 404 for an unknown gathering", async () => {
    const response = await register("ALICE", "unknown")

    expect(response.statusCode).toStrictEqual(404)
    expect(response.json()).toStrictEqual({ message: "Gathering unknown not found" })
  })

  test("responds 409 for a second registration", async () => {
    await register("ALICE")

    const response = await register("ALICE")

    expect(response.statusCode).toStrictEqual(409)
  })

  test.todo("responds 409 once the gathering date is passed (needs a dedicated domain error)")
})
