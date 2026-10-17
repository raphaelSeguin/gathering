import { UUID } from "node:crypto";

export interface IdGenerator {
  nextId(): UUID
}
