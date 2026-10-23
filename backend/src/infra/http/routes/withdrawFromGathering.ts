import { FastifyInstance } from "fastify"
import { z } from "zod"
import { GatheringWithdrawal } from "../../../application/use-cases/GatheringWithdrawal.js"
import { requireUserId } from "../currentUser.js"

const paramsSchema = z.object({ id: z.string() })

export function withdrawFromGatheringRoute(
  app: FastifyInstance,
  deps: { gatheringWithdrawal: GatheringWithdrawal }
) {
  app.delete("/gatherings/:id/registrations", async (request, reply) => {
    const userId = requireUserId(request)
    const { id } = paramsSchema.parse(request.params)
    await deps.gatheringWithdrawal.execute({ userId, gatheringId: id })
    return reply.status(204).send()
  })
}
