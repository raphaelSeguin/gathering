import { buildApp } from "./infra/http/app.js"
import { SystemClock } from "./infra/Clock.js"
import { UUIDGenerator } from "./infra/IdGenerator.js"
import { FileGatheringRepository } from "./infra/persistence/GatheringRepositoryFile.js"
import { InMemoryGatheringRepository } from "./infra/persistence/GatheringRepositoryInMemory.js"

const DEMO_FILE = "demo-gatherings.json"

const gatheringRepository = process.env.DEMO
  ? new FileGatheringRepository(DEMO_FILE)
  : new InMemoryGatheringRepository()

const app = buildApp({
  repository: gatheringRepository,
  idGenerator: new UUIDGenerator(),
  clock: new SystemClock()
})

await app.listen({ port: Number(process.env.PORT ?? 3000) })
console.log(`Backend listening on ${app.listeningOrigin}`)
if (process.env.DEMO) {
  console.log(`Demo mode: gatherings are stored in ${DEMO_FILE}`)
}
