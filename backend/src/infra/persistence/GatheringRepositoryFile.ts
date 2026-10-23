import { readFile } from "node:fs/promises"
import { GatheringRepository } from "../../application/ports/GatheringRepository.js"
import { Gathering } from "../../domain/Gathering.js"

type GatheringRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  organizerId: string;
  participants: string[];
}

export class FileGatheringRepository implements GatheringRepository {
  constructor(private readonly filePath: string) { }

  async save(_gathering: Gathering): Promise<void> {
    throw new Error("Not implemented yet")
  }

  async findById(id: string): Promise<Gathering | undefined> {
    const record = (await this.readRecords()).find((r) => r.id === id)
    return record ? fromRecord(record) : undefined
  }

  async findAll(): Promise<Gathering[]> {
    return (await this.readRecords()).map(fromRecord)
  }

  private async readRecords(): Promise<GatheringRecord[]> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8"))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return []
      }
      throw error
    }
  }
}

function fromRecord(record: GatheringRecord): Gathering {
  return Gathering.reconstitue({
    id: record.id,
    title: record.title,
    description: record.description,
    date: new Date(record.date),
    capacity: record.capacity,
    organizerId: record.organizerId,
    participantsIds: record.participants
  })
}
