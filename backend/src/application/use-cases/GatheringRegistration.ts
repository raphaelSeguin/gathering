import { GatheringNotFoundError } from "../errors.js"
import { RegistrationStatus } from "../../domain/Gathering.js";
import { Clock } from "../ports/Clock.js";
import { GatheringRepository } from "../ports/GatheringRepository.js"

type GatheringRegistrationDependencies = {
  repository: GatheringRepository;
  clock: Clock
}

type GatheringRegistrationPayload = {
  userId: string;
  gatheringId: string;
}

export class GatheringRegistration {
  constructor(private readonly deps: GatheringRegistrationDependencies) { }
  async execute(payload: GatheringRegistrationPayload): Promise<RegistrationStatus> {
    const gathering = await this.deps.repository.findById(payload.gatheringId)
    if (!gathering) {
      throw new GatheringNotFoundError(payload.gatheringId)
    }
    gathering.register(payload.userId, this.deps.clock.now())
    await this.deps.repository.save(gathering)
    return gathering.getParticipantStatus(payload.userId)
  }
}
