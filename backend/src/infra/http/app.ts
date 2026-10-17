import Fastify, { FastifyInstance } from "fastify"
import { GatheringCreation } from "../../application/use-cases/GatheringCreation.js"
import { GatheringDetails } from "../../application/use-cases/GatheringDetails.js"
import { Clock } from "../../application/ports/Clock.js"
import { GatheringRepository } from "../../application/ports/GatheringRepository.js"
import { IdGenerator } from "../../application/ports/IdGenerator.js"
import { errorHandler } from "./errorHandler.js"
import { createGatheringRoute } from "./routes/createGathering.js"
import { getGatheringRoute } from "./routes/getGathering.js"

export type AppDependencies = {
  repository: GatheringRepository;
  idGenerator: IdGenerator;
  clock: Clock;
}

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify()
  app.setErrorHandler(errorHandler)

  const gatheringDetails = new GatheringDetails({ repository: deps.repository })
  const gatheringCreation = new GatheringCreation(deps)

  app.register(async (api) => {
    getGatheringRoute(api, { gatheringDetails })
    createGatheringRoute(api, { gatheringCreation, gatheringDetails })
  }, { prefix: "/api" })

  return app
}
