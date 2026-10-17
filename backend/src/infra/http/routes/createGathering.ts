import { FastifyInstance } from "fastify"
import { z } from "zod"
import { GatheringCreation } from "../../../application/use-cases/GatheringCreation.js"
import { GatheringDetails } from "../../../application/use-cases/GatheringDetails.js"
import { requireUserId } from "../currentUser.js"
import { toGatheringDto } from "../GatheringDto.js"

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  date: z.iso.datetime({ offset: true }).transform((date) => new Date(date)),
  capacity: z.number().int()
})

export function createGatheringRoute(
  app: FastifyInstance,
  deps: { gatheringCreation: GatheringCreation, gatheringDetails: GatheringDetails }
) {
  app.post("/gatherings", async (request, reply) => {
    const organizerId = requireUserId(request)
    const body = bodySchema.parse(request.body)
    const id = await deps.gatheringCreation.execute({ ...body, organizerId })
    const gathering = await deps.gatheringDetails.execute({ gatheringId: id })
    return reply
      .status(201)
      .header("location", `/api/gatherings/${id}`)
      .send(toGatheringDto(gathering, organizerId))
  })
}
