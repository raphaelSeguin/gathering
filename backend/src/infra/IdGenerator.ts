import { randomUUID, UUID } from "node:crypto";
import { IdGenerator } from "../application/ports/IdGenerator.js";

export class UUIDGenerator implements IdGenerator {
  nextId(): UUID {
    return randomUUID()
  }
}
