import Fastify, { FastifyInstance } from "fastify"
import { GatheringCreation } from "../../application/use-cases/GatheringCreation.js"
import { GatheringDetails } from "../../application/use-cases/GatheringDetails.js"
import { GatheringModification } from "../../application/use-cases/GatheringModification.js"
import { GatheringRegistration } from "../../application/use-cases/GatheringRegistration.js"
import { Clock } from "../../application/ports/Clock.js"
import { GatheringRepository } from "../../application/ports/GatheringRepository.js"
import { IdGenerator } from "../../application/ports/IdGenerator.js"
import { errorHandler } from "./errorHandler.js"
import { createGatheringRoute } from "./routes/createGathering.js"
import { getGatheringRoute } from "./routes/getGathering.js"
import { modifyGatheringRoute } from "./routes/modifyGathering.js"
import { registerToGatheringRoute } from "./routes/registerToGathering.js"

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
  const gatheringModification = new GatheringModification({ repository: deps.repository })
  const gatheringRegistration = new GatheringRegistration(deps)

  app.register(async (api) => {
    getGatheringRoute(api, { gatheringDetails })
    createGatheringRoute(api, { gatheringCreation, gatheringDetails })
    modifyGatheringRoute(api, { gatheringModification, gatheringDetails })
    registerToGatheringRoute(api, { gatheringRegistration })
  }, { prefix: "/api" })

  return app
}
