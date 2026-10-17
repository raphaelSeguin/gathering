import { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import { GatheringNotFoundError } from "../../application/errors.js"

function statusFor(error: FastifyError): number {
  if (error instanceof GatheringNotFoundError) return 404
  return error.statusCode ?? 500
}

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const status = statusFor(error)
  if (status >= 500) {
    request.log.error(error)
    return reply.status(status).send({ message: "Internal Server Error" })
  }
  return reply.status(status).send({ message: error.message })
}
