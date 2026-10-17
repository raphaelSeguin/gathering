import { FastifyRequest } from "fastify"

export function optionalUserId(request: FastifyRequest): string | undefined {
  const userId = request.headers["x-user-id"]
  return typeof userId === "string" && userId !== "" ? userId : undefined
}
