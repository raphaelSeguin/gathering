export class GatheringNotFoundError extends Error {
  constructor(gatheringId: string) {
    super(`Gathering ${gatheringId} not found`)
    this.name = "GatheringNotFoundError"
  }
}
