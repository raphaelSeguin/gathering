import { FastifyInstance } from "fastify"
import { GatheringList } from "../../../application/use-cases/GatheringList.js"
import { optionalUserId } from "../currentUser.js"
import { toGatheringDto } from "../GatheringDto.js"

export function listGatheringsRoute(app: FastifyInstance, deps: { gatheringList: GatheringList }) {
  app.get("/gatherings", async (request) => {
    const userId = optionalUserId(request)
    const gatherings = await deps.gatheringList.execute()
    return gatherings.map((gathering) => toGatheringDto(gathering, userId))
  })
}
