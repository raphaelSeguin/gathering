import { beforeEach, describe, expect, test } from "vitest"
import { CreationData, Gathering, LateWithdrawalError } from "../../domain/Gathering.js"
import { InMemoryGatheringRepository } from "../../infra/persistence/GatheringRepositoryInMemory.js"
import { GatheringRepository } from "../ports/GatheringRepository.js"
import { GatheringWithdrawal } from "./GatheringWithdrawal.js"
import { FixedClock } from "../../infra/Clock.js"
import { GatheringNotFoundError } from "../errors.js"

describe("Withdrawal from a Gathering", () => {
  let gathering: Gathering
  let gatheringRepository: GatheringRepository
  const registrationDate = new Date("2022-03-01")

  const creationData: CreationData = {
    capacity: 2,
    date: new Date("2022-03-15"),
    organizerId: "SAM",
    title: "A new gathering",
    description: "Test gathering",
    id: "1234"
  }
  beforeEach(async () => {
    gathering = Gathering.schedule(creationData, new Date("2020-12-31"))
    gatheringRepository = new InMemoryGatheringRepository()
    await gatheringRepository.save(gathering)
  })

  test("A registered participant withdraws from a gathering", async () => {
    gathering.register("ALICE", registrationDate)
    const gatheringWithdrawal = new GatheringWithdrawal({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-10"))
    })
    await gatheringWithdrawal.execute({
      userId: "ALICE",
      gatheringId: "1234"
    })
    const savedGathering = await gatheringRepository.findById("1234")
    expect(savedGathering?.getParticipants()).toStrictEqual([])
  })

  test("Withdrawing from an unknown gathering is rejected", async () => {
    const gatheringWithdrawal = new GatheringWithdrawal({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-10"))
    })
    await expect(() => gatheringWithdrawal.execute({
      userId: "ALICE",
      gatheringId: "unknown"
    })).rejects.toThrow(GatheringNotFoundError)
  })

  test("Withdrawing is impossible after the gathering date", async () => {
    gathering.register("ALICE", registrationDate)
    const gatheringWithdrawal = new GatheringWithdrawal({
      repository: gatheringRepository,
      clock: new FixedClock(new Date("2022-03-16"))
    })
    await expect(() => gatheringWithdrawal.execute({
      userId: "ALICE",
      gatheringId: "1234"
    })).rejects.toThrow(LateWithdrawalError)
    const savedGathering = await gatheringRepository.findById("1234")
    expect(savedGathering?.getParticipants()).toStrictEqual(["ALICE"])
  })
})
