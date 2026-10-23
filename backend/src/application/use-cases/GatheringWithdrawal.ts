import { GatheringNotFoundError } from "../errors.js"
import { Clock } from "../ports/Clock.js";
import { GatheringRepository } from "../ports/GatheringRepository.js"

type GatheringWithdrawalDependencies = {
  repository: GatheringRepository;
  clock: Clock
}

type GatheringWithdrawalPayload = {
  userId: string;
  gatheringId: string;
}

export class GatheringWithdrawal {
  constructor(private readonly deps: GatheringWithdrawalDependencies) { }
  async execute(payload: GatheringWithdrawalPayload): Promise<void> {
    const gathering = await this.deps.repository.findById(payload.gatheringId)
    if (!gathering) {
      throw new GatheringNotFoundError(payload.gatheringId)
    }
    gathering.withdraw(payload.userId, this.deps.clock.now())
    console.log(gathering.pullDomainEvents())
    await this.deps.repository.save(gathering)
  }
}
