import { Gathering } from "../../domain/Gathering.js"

export interface GatheringRepository {
  save(gathering: Gathering): Promise<void>
  findById(id: string): Promise<Gathering | undefined>
}

