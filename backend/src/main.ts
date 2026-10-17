import { buildApp } from "./infra/http/app.js"
import { SystemClock } from "./infra/Clock.js"
import { UUIDGenerator } from "./infra/IdGenerator.js"
import { InMemoryGatheringRepository } from "./infra/persistence/GatheringRepositoryInMemory.js"

const app = buildApp({
  repository: new InMemoryGatheringRepository(),
  idGenerator: new UUIDGenerator(),
  clock: new SystemClock()
})

await app.listen({ port: Number(process.env.PORT ?? 3000) })
console.log(`Backend listening on ${app.listeningOrigin}`)
