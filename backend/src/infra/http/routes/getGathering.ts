import { FastifyInstance } from "fastify"
import { z } from "zod"
import { GatheringDetails } from "../../../application/use-cases/GatheringDetails.js"
import { optionalUserId } from "../currentUser.js"
import { toGatheringDto } from "../GatheringDto.js"

const paramsSchema = z.object({ id: z.string() })

export function getGatheringRoute(app: FastifyInstance, deps: { gatheringDetails: GatheringDetails }) {
  app.get("/gatherings/:id", async (request) => {
    const { id } = paramsSchema.parse(request.params)
    const gathering = await deps.gatheringDetails.execute({ gatheringId: id })
    return toGatheringDto(gathering, optionalUserId(request))
  })
}
