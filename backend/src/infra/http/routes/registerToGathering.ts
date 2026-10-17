import { FastifyInstance } from "fastify"
import { z } from "zod"
import { GatheringRegistration } from "../../../application/use-cases/GatheringRegistration.js"
import { requireUserId } from "../currentUser.js"

const paramsSchema = z.object({ id: z.string() })

export function registerToGatheringRoute(
  app: FastifyInstance,
  deps: { gatheringRegistration: GatheringRegistration }
) {
  app.post("/gatherings/:id/registrations", async (request, reply) => {
    const userId = requireUserId(request)
    const { id } = paramsSchema.parse(request.params)
    const status = await deps.gatheringRegistration.execute({ usedId: userId, gatheringId: id })
    return reply.status(201).send({ status })
  })
}
