import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import {
  afterAll,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  describe,
  test
} from "matchstick-as/assembly/index"
import { Claimed as ClaimedEvent } from "../generated/MerkleRedeem/MerkleRedeem"
import {
  Claimed,
  ClaimedByPeriod as ClaimedByPeriodEntity,
  Claimed as ClaimedEntity,
  ClaimedTotalByFrom as ClaimedTotalByFromEntity,
  ClaimedTotalByRecipient as ClaimedTotalByRecipientEntity,
  ClaimedTotal as ClaimedTotalEntity,
  OwnerChanged as OwnerChangedEntity,
  OwnerNominated as OwnerNominatedEntity
} from "../generated/schema"
import { concatIndex, getEventId, handleClaimed } from "../src/merkle-redeem"
import { createClaimedEvent, CustomEvents } from "./merkle-redeem-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const one = Bytes.fromI32(1).toHexString()

describe("Describe entity assertions", () => {
  beforeAll(() => {
    // clear the store before each test in the file
    clearStore()

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })

  beforeEach(() => {
    // clear the store before each test in the file
    clearStore()
  })

  afterAll(() => {
    // clear the store after all test in the file
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test(
    "ClaimPeriod() method occurs",
    () => {
      const newClaimPeriodEvent = CustomEvents.createClaimPeriodEvent()
      handleClaimed(newClaimPeriodEvent)

      const balance = "570759569000000000000"
      const balanceBigInt = BigInt.fromString(balance)
      const period = BigInt.fromI32(0)

      const id = getEventId(newClaimPeriodEvent)
      const idString = id.toHexString()
      const from = Address.fromString(
        "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
      )
        .toHexString()
        .toLowerCase()
      const recipient = Address.fromString(
        "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
      )
        .toHexString()
        .toLowerCase()

      // Entity counter checks
      assert.entityCount("Claimed", 1)
      assert.entityCount("ClaimedByPeriod", 1)
      assert.entityCount("ClaimedTotal", 1)
      assert.entityCount("ClaimedTotalByRecipient", 1)
      assert.entityCount("ClaimedTotalByFrom", 1)

      // The from checks
      assert.fieldEquals("Claimed", idString, "from", from)
      assert.fieldEquals("ClaimedTotalByFrom", from, "from", from) // The from as this entity id

      // The recipient checks
      assert.fieldEquals("Claimed", idString, "recipient", recipient)
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient, // The recipient as this entity id
        "recipient",
        recipient
      )

      // Entity fields checks
      assert.fieldEquals("ClaimedTotal", one, "total", balance)
      assert.fieldEquals("ClaimedTotalByFrom", from, "total", balance)
      assert.fieldEquals("ClaimedTotalByRecipient", recipient, "total", balance)

      // The from checks
      assert.fieldEquals(
        "ClaimedByPeriod",
        concatIndex(id, 0).toHexString(),
        "from",
        from
      )
      // The recipient checks
      assert.fieldEquals(
        "ClaimedByPeriod",
        concatIndex(id, 0).toHexString(),
        "recipient",
        recipient
      )
      // The period checks
      assert.fieldEquals(
        "ClaimedByPeriod",
        concatIndex(id, 0).toHexString(),
        "period",
        period.toString()
      )
      // The period checks
      assert.fieldEquals(
        "ClaimedByPeriod",
        concatIndex(id, 0).toHexString(),
        "balance",
        balance
      )
    },
    false // Expected success
  )

  test(
    "ClaimPeriods() method occurs with single periods",
    () => {
      const newClaimPeriodsSingleEvent =
        CustomEvents.createClaimPeriodsSingleEvent()
      handleClaimed(newClaimPeriodsSingleEvent)

      const balance = "20000000000000000000"
      const balanceBigInt = BigInt.fromString(balance)
      const periods: Array<BigInt> = [0].map<BigInt>((num) =>
        BigInt.fromI32(num)
      )
      const periodsLength = periods.length

      const id = getEventId(newClaimPeriodsSingleEvent)
      const idString = id.toHexString()
      const from = Address.fromString(
        "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
      )
        .toHexString()
        .toLowerCase()
      const recipient = Address.fromString(
        "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
      )
        .toHexString()
        .toLowerCase()

      // Entity counter checks
      assert.entityCount("Claimed", 1)
      assert.entityCount("ClaimedByPeriod", periodsLength)
      assert.entityCount("ClaimedTotal", 1)
      assert.entityCount("ClaimedTotalByRecipient", 1)
      assert.entityCount("ClaimedTotalByFrom", 1)

      // The from checks
      assert.fieldEquals("Claimed", idString, "from", from)
      assert.fieldEquals("ClaimedTotalByFrom", from, "from", from) // The from as this entity id

      // The recipient checks
      assert.fieldEquals("Claimed", idString, "recipient", recipient)
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient, // The recipient as this entity id
        "recipient",
        recipient
      )

      // Entity fields checks
      assert.fieldEquals("ClaimedTotal", one, "total", balance)
      assert.fieldEquals("ClaimedTotalByFrom", from, "total", balance)
      assert.fieldEquals("ClaimedTotalByRecipient", recipient, "total", balance)

      // Entity ClaimedByPeriod check
      let totalTest = BigInt.fromI32(0)
      for (let i: i32 = 0; i < periodsLength; i++) {
        const claimedByPeriodEntity = ClaimedByPeriodEntity.load(
          concatIndex(id, i)
        )
        // Plus the balances per period
        if (claimedByPeriodEntity) {
          totalTest = totalTest.plus(claimedByPeriodEntity.balance)
        }

        // The from checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "from",
          from
        )
        // The recipient checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "recipient",
          recipient
        )
        // The period checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          periods[i].toString()
        )
      }

      // Check the total balance
      assert.bigIntEquals(totalTest, balanceBigInt)
    },
    false // Expected success
  )

  test(
    "ClaimPeriods() method occurs with multiple periods",
    () => {
      const newClaimPeriodsMultipleEvent =
        CustomEvents.createClaimPeriodsMultipleEvent()
      handleClaimed(newClaimPeriodsMultipleEvent)

      const balance = "564572885000000000000"
      const balanceBigInt = BigInt.fromString(balance)
      const periods: Array<BigInt> = [
        25, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13
      ].map<BigInt>((num) => BigInt.fromI32(num))
      const periodsLength = periods.length

      const id = getEventId(newClaimPeriodsMultipleEvent)
      const idString = id.toHexString()
      const from = Address.fromString(
        "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
      )
        .toHexString()
        .toLowerCase()
      const recipient = Address.fromString(
        "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
      )
        .toHexString()
        .toLowerCase()

      // Entity counter checks
      assert.entityCount("Claimed", 1)
      assert.entityCount("ClaimedByPeriod", periodsLength)
      assert.entityCount("ClaimedTotal", 1)
      assert.entityCount("ClaimedTotalByRecipient", 1)
      assert.entityCount("ClaimedTotalByFrom", 1)

      // The from checks
      assert.fieldEquals("Claimed", idString, "from", from)
      assert.fieldEquals("ClaimedTotalByFrom", from, "from", from) // The from as this entity id

      // The recipient checks
      assert.fieldEquals("Claimed", idString, "recipient", recipient)
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient, // The recipient as this entity id
        "recipient",
        recipient
      )

      // Entity fields checks
      assert.fieldEquals("ClaimedTotal", one, "total", balance)
      assert.fieldEquals("ClaimedTotalByFrom", from, "total", balance)
      assert.fieldEquals("ClaimedTotalByRecipient", recipient, "total", balance)

      // Entity ClaimedByPeriod check
      let totalTest = BigInt.fromI32(0)
      for (let i: i32 = 0; i < periodsLength; i++) {
        const claimedByPeriodEntity = ClaimedByPeriodEntity.load(
          concatIndex(id, i)
        )
        // Plus the balances per period
        if (claimedByPeriodEntity) {
          totalTest = totalTest.plus(claimedByPeriodEntity.balance)
        }

        // The from checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "from",
          from
        )
        // The recipient checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "recipient",
          recipient
        )
        // The period checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          periods[i].toString()
        )
      }

      // Check the total balance
      assert.bigIntEquals(totalTest, balanceBigInt)
    },
    false // Expected success
  )
})
