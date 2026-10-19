import { beforeEach, describe, expect, test } from "vitest"
import { FastifyInstance } from "fastify"
import { Gathering } from "../../../domain/Gathering.js"
import { FixedClock } from "../../Clock.js"
import { UUIDGenerator } from "../../IdGenerator.js"
import { InMemoryGatheringRepository } from "../../persistence/GatheringRepositoryInMemory.js"
import { buildApp } from "../app.js"

describe("PATCH /api/gatherings/:id", () => {
  const NOW = new Date("2026-01-01T00:00:00.000Z")
  let app: FastifyInstance
  let gathering: Gathering

  beforeEach(async () => {
    const repository = new InMemoryGatheringRepository()
    gathering = Gathering.schedule({
      id: "1234",
      title: "A new gathering",
      description: "Test gathering",
      date: new Date("2026-02-02T18:00:00.000Z"),
      capacity: 5,
      organizerId: "SAM"
    }, NOW)
    await repository.save(gathering)
    app = buildApp({ repository, idGenerator: new UUIDGenerator(), clock: new FixedClock(NOW) })
  })

  const modify = (body: unknown, { id = "1234", userId = "SAM" }: { id?: string, userId?: string } = {}) =>
    app.inject({
      method: "PATCH",
      url: `/api/gatherings/${id}`,
      payload: body as object,
      headers: userId ? { "x-user-id": userId } : {}
    })

  test("the organizer modifies capacity, description and title", async () => {
    const response = await modify({ capacity: 60, description: "Another description", title: "Another title" })

    expect(response.statusCode).toStrictEqual(200)
    expect(response.json()).toMatchObject({
      id: "1234",
      capacity: 60,
      description: "Another description",
      title: "Another title"
    })
  })

  test("responds 401 without a current user", async () => {
    const response = await modify({ capacity: 60 }, { userId: "" })

    expect(response.statusCode).toStrictEqual(401)
  })

  test("responds 400 for an empty body", async () => {
    const response = await modify({})

    expect(response.statusCode).toStrictEqual(400)
  })

  test("responds 403 when the user is not the organizer", async () => {
    const response = await modify({ capacity: 60 }, { userId: "BOB" })

    expect(response.statusCode).toStrictEqual(403)
  })

  test("responds 404 for an unknown gathering", async () => {
    const response = await modify({ capacity: 60 }, { id: "unknown" })

    expect(response.statusCode).toStrictEqual(404)
  })

  test("responds 409 for a capacity below the number of registrations", async () => {
    gathering.register("ALICE", NOW)
    gathering.register("BOB", NOW)
    gathering.register("CHLOE", NOW)

    const response = await modify({ capacity: 2 })

    expect(response.statusCode).toStrictEqual(409)
  })

  test("responds 422 for a capacity below two", async () => {
    const response = await modify({ capacity: 1, description: "Another description" })

    expect(response.statusCode).toStrictEqual(422)
    const fetched = await app.inject({ method: "GET", url: "/api/gatherings/1234" })
    expect(fetched.json().description).toStrictEqual("Test gathering")
  })
})
