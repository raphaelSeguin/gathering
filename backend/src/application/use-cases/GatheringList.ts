import { Gathering } from "../../domain/Gathering.js"
import { GatheringRepository } from "../ports/GatheringRepository.js"

type GatheringListDependencies = {
  repository: GatheringRepository;
}

export class GatheringList {
  constructor(private readonly deps: GatheringListDependencies) { }
  async execute(): Promise<Gathering[]> {
    return this.deps.repository.findAll()
  }
}
