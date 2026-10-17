import { FastifyInstance } from "fastify"
import { z } from "zod"
import { GatheringDetails } from "../../../application/use-cases/GatheringDetails.js"
import { GatheringModification } from "../../../application/use-cases/GatheringModification.js"
import { requireUserId } from "../currentUser.js"
import { toGatheringDto } from "../GatheringDto.js"

const paramsSchema = z.object({ id: z.string() })

const bodySchema = z.object({
  capacity: z.number().int().optional(),
  description: z.string().optional(),
  title: z.string().min(1).optional()
}).refine(
  (body) => Object.values(body).some((value) => value !== undefined),
  "At least one of capacity, description or title is required"
)

export function modifyGatheringRoute(
  app: FastifyInstance,
  deps: { gatheringModification: GatheringModification, gatheringDetails: GatheringDetails }
) {
  app.patch("/gatherings/:id", async (request) => {
    const userId = requireUserId(request)
    const { id: gatheringId } = paramsSchema.parse(request.params)
    const { capacity, description, title } = bodySchema.parse(request.body)

    // Capacity goes first: it is the only change that can be rejected on its value,
    // so a refusal leaves the gathering untouched.
    if (capacity !== undefined) {
      await deps.gatheringModification.execute({ type: "capacity", content: capacity, userId, gatheringId })
    }
    if (description !== undefined) {
      await deps.gatheringModification.execute({ type: "description", content: description, userId, gatheringId })
    }
    if (title !== undefined) {
      await deps.gatheringModification.execute({ type: "title", content: title, userId, gatheringId })
    }

    const gathering = await deps.gatheringDetails.execute({ gatheringId })
    return toGatheringDto(gathering, userId)
  })
}
