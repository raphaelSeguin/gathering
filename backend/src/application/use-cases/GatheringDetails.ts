import { Gathering } from "../../domain/Gathering.js"
import { GatheringNotFoundError } from "../errors.js"
import { GatheringRepository } from "../ports/GatheringRepository.js"

type GatheringDetailsDependencies = {
  repository: GatheringRepository;
}

type GatheringDetailsPayload = {
  gatheringId: string;
}

export class GatheringDetails {
  constructor(private readonly deps: GatheringDetailsDependencies) { }
  async execute(payload: GatheringDetailsPayload): Promise<Gathering> {
    const gathering = await this.deps.repository.findById(payload.gatheringId)
    if (!gathering) {
      throw new GatheringNotFoundError(payload.gatheringId)
    }
    return gathering
  }
}
