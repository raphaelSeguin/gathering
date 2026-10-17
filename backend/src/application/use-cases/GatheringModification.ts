import { GatheringRepository } from "../ports/GatheringRepository.js"

type ModificationPaylod =
  | {
    type: "description",
    content: string
  } | {
    type: "title",
    content: string
  } | {
    type: "capacity",
    content: number
  }

export type GatheringModificationPaylod =
  ModificationPaylod
  & { userId: string }
  & { gatheringId: string }

type GatheringModificationDependencies = {
  repository: GatheringRepository;
}

export class GatheringModification {
  constructor(private readonly deps: GatheringModificationDependencies) { }
  async execute(payload: GatheringModificationPaylod) {
    const gathering = await this.deps.repository.findById(payload.gatheringId)
    if (!gathering) {
      throw new Error(`Gathering ${payload.gatheringId} not found`)
    }
    switch (payload.type) {
      case "description": {
        gathering.changeDescription(payload.content, payload.userId)
        break
      }
      case "title": {
        gathering.changeTitle(payload.content, payload.userId)
        break
      }
      case "capacity": {
        gathering.changeCapacity(payload.content, payload.userId)
        break
      }
    }
    await this.deps.repository.save(gathering)
  }
}
