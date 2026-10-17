import { beforeEach, describe, expect, test } from "vitest"
import { FastifyInstance } from "fastify"
import { FixedClock } from "../../Clock.js"
import { UUIDGenerator } from "../../IdGenerator.js"
import { InMemoryGatheringRepository } from "../../persistence/GatheringRepositoryInMemory.js"
import { buildApp } from "../app.js"

describe("POST /api/gatherings", () => {
  const NOW = new Date("2026-01-01T00:00:00.000Z")
  const validBody = {
    title: "A new gathering",
    description: "Test gathering",
    date: "2026-02-02T18:00:00.000Z",
    capacity: 10
  }
  let app: FastifyInstance

  beforeEach(() => {
    app = buildApp({
      repository: new InMemoryGatheringRepository(),
      idGenerator: new UUIDGenerator(),
      clock: new FixedClock(NOW)
    })
  })

  const create = (body: unknown, headers: Record<string, string> = { "x-user-id": "SAM" }) =>
    app.inject({ method: "POST", url: "/api/gatherings", payload: body as object, headers })

  test("creates a gathering organized by the current user", async () => {
    const response = await create(validBody)

    expect(response.statusCode).toStrictEqual(201)
    const dto = response.json()
    expect(dto).toMatchObject({
      ...validBody,
      participantCount: 0,
      waitlist: [],
      organizerId: "SAM",
      myStatus: "unregistered"
    })
    expect(response.headers.location).toStrictEqual(`/api/gatherings/${dto.id}`)

    const fetched = await app.inject({ method: "GET", url: `/api/gatherings/${dto.id}` })
    expect(fetched.statusCode).toStrictEqual(200)
  })

  test("responds 401 without a current user", async () => {
    const response = await create(validBody, {})

    expect(response.statusCode).toStrictEqual(401)
  })

  test("responds 400 for an invalid body", async () => {
    const response = await create({ ...validBody, date: "tomorrow", capacity: "ten" })

    expect(response.statusCode).toStrictEqual(400)
    expect(response.json().message).toEqual(expect.any(String))
  })

  test("responds 422 for a gathering in the past", async () => {
    const response = await create({ ...validBody, date: "2025-12-31T18:00:00.000Z" })

    expect(response.statusCode).toStrictEqual(422)
  })

  test("responds 422 for a capacity below two", async () => {
    const response = await create({ ...validBody, capacity: 1 })

    expect(response.statusCode).toStrictEqual(422)
  })
})
