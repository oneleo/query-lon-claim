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

export const arrayToString = (arr: Array<BigInt>): string => {
  let result: string = "["
  for (let i: i32 = 0; i < arr.length; i++) {
    if (i > 0) {
      result = result.concat(", ")
    }
    result = result.concat(arr[i].toString())
  }
  result = result.concat("]")
  return result
}

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

      // The periods and the balances array checks
      assert.fieldEquals(
        "Claimed",
        idString,
        "balances",
        arrayToString([balanceBigInt])
      )
      assert.fieldEquals(
        "Claimed",
        idString,
        "periods",
        arrayToString([period])
      )

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
      assert.fieldEquals("ClaimedTotal", one, "totalBalance", balance)
      assert.fieldEquals("ClaimedTotalByFrom", from, "totalPeriod", "1")
      assert.fieldEquals("ClaimedTotalByFrom", from, "totalBalance", balance)
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient,
        "totalPeriod",
        "1"
      )
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient,
        "totalBalance",
        balance
      )

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
      const balances: Array<BigInt> = [balance].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
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

      // The periods and the balances array checks
      assert.fieldEquals(
        "Claimed",
        idString,
        "balances",
        arrayToString(balances)
      )
      assert.fieldEquals("Claimed", idString, "periods", arrayToString(periods))

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
      assert.fieldEquals("ClaimedTotal", one, "totalBalance", balance)
      assert.fieldEquals("ClaimedTotalByFrom", from, "totalPeriod", "1")
      assert.fieldEquals("ClaimedTotalByFrom", from, "totalBalance", balance)
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient,
        "totalPeriod",
        "1"
      )
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient,
        "totalBalance",
        balance
      )

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
      const balances: Array<BigInt> = [
        "130630468000000000000",
        "2316868000000000000",
        "2247909000000000000",
        "1252679000000000000",
        "1677993000000000000",
        "4276680000000000000",
        "70154602000000000000",
        "9925028000000000000",
        "139978163000000000000",
        "86257147000000000000",
        "60676810000000000000",
        "55178538000000000000"
      ].map<BigInt>((str) => BigInt.fromString(str))
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

      // The periods and the balances array checks
      assert.fieldEquals(
        "Claimed",
        idString,
        "balances",
        arrayToString(balances)
      )
      assert.fieldEquals("Claimed", idString, "periods", arrayToString(periods))

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
      assert.fieldEquals("ClaimedTotal", one, "totalBalance", balance)
      assert.fieldEquals(
        "ClaimedTotalByFrom",
        from,
        "totalPeriod",
        periodsLength.toString()
      )
      assert.fieldEquals("ClaimedTotalByFrom", from, "totalBalance", balance)
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient,
        "totalPeriod",
        periodsLength.toString()
      )
      assert.fieldEquals(
        "ClaimedTotalByRecipient",
        recipient,
        "totalBalance",
        balance
      )

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
    "execute() method occurs",
    () => {
      const newExecuteEvent = CustomEvents.createExecuteEvent()
      handleClaimed(newExecuteEvent)

      const balance = "1000000000000000000000"
      const balanceBigInt = BigInt.fromString(balance)
      const balances: Array<BigInt> = [balance].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
      const periods = [null]
      const periodsLength = periods.length

      const id = getEventId(newExecuteEvent)
      const idString = id.toHexString()
      const from = Address.fromString(
        "0x4eD51224672aaD35d50F2ee49b0fdC9958618d38"
      )
        .toHexString()
        .toLowerCase()
      const recipient = Address.fromString(
        "0x3021B1A8bB7d73d0afaA3537040EfAb630dB2958"
      )
        .toHexString()
        .toLowerCase()

      // The periods and the balances array checks
      assert.fieldEquals(
        "Claimed",
        idString,
        "balances",
        arrayToString(balances)
      )
      assert.fieldEquals(
        "Claimed",
        idString,
        "periods",
        arrayToString([BigInt.fromI32(i32.MAX_VALUE)])
      ) // Employing i32.MAX_VALUE as the unknown period value.

      for (let i: i32 = 0; i < periodsLength; i++) {
        // The period checks
        assert.fieldEquals(
          "ClaimedByPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          "null" // unknown period
        )
      }
    },
    false // Expected success
  )
})
