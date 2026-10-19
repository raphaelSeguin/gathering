import { UUID } from "node:crypto";
import { Gathering } from "../../domain/Gathering.js";
import { Clock } from "../ports/Clock.js";
import { GatheringRepository } from "../ports/GatheringRepository.js";
import { IdGenerator } from "../ports/IdGenerator.js";

export type GatheringCreationPayload = {
  date: Date;
  description: string;
  title: string;
  organizerId: string;
  capacity: number;
}

type GatheringCreationDependencies = {
  repository: GatheringRepository;
  idGenerator: IdGenerator;
  clock: Clock;
}

export class GatheringCreation {
  constructor(
    private readonly deps: GatheringCreationDependencies
  ) { }
  async execute({
    date,
    description,
    title,
    organizerId,
    capacity,
  }: GatheringCreationPayload): Promise<UUID> {
    const id = this.deps.idGenerator.nextId()
    const now = this.deps.clock.now()

    const gathering = Gathering.schedule({
      organizerId,
      capacity,
      date,
      id,
      title,
      description
    }, now)

    await this.deps.repository.save(gathering)

    return id
  }
}
