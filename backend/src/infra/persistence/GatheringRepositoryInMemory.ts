import { GatheringRepository } from "../../application/ports/GatheringRepository.js"
import { Gathering } from "../../domain/Gathering.js"

export class InMemoryGatheringRepository implements GatheringRepository {
  gatherings = new Map<string, Gathering>()

  async save(gathering: Gathering): Promise<void> {
    this.gatherings.set(gathering.getId(), gathering)
  }

  async findById(id: string): Promise<Gathering | undefined> {
    if (!this.gatherings.has(id)) {
      throw new Error("Gathering Not Found")
    }
    return this.gatherings.get(id)
  }
}
