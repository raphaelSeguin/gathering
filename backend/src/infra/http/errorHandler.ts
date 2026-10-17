import { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import { z, ZodError } from "zod"
import { GatheringNotFoundError } from "../../application/errors.js"
import { InvalidCapacityCreationError } from "../../domain/Capacity.js"
import { InvalidDateError } from "../../domain/Gathering.js"
import { MissingUserError } from "./currentUser.js"

function statusFor(error: Error): number {
  if (error instanceof ZodError) return 400
  if (error instanceof MissingUserError) return 401
  if (error instanceof GatheringNotFoundError) return 404
  if (error instanceof InvalidCapacityCreationError
    || error instanceof InvalidDateError) return 422
  return (error as FastifyError).statusCode ?? 500
}

function messageFor(error: Error): string {
  return error instanceof ZodError ? z.prettifyError(error) : error.message
}

export function errorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
  const status = statusFor(error)
  if (status >= 500) {
    request.log.error(error)
    return reply.status(status).send({ message: "Internal Server Error" })
  }
  return reply.status(status).send({ message: messageFor(error) })
}
