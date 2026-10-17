import { FastifyRequest } from "fastify"

export function optionalUserId(request: FastifyRequest): string | undefined {
  const userId = request.headers["x-user-id"]
  return typeof userId === "string" && userId !== "" ? userId : undefined
}

export class MissingUserError extends Error {
  constructor() {
    super("X-User-Id header is required")
    this.name = "MissingUserError"
  }
}

export function requireUserId(request: FastifyRequest): string {
  const userId = optionalUserId(request)
  if (!userId) {
    throw new MissingUserError()
  }
  return userId
}
