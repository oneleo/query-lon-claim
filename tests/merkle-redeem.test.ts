import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  afterAll,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  describe,
  test
} from "matchstick-as/assembly/index"
import { concatIndex, getEventId, handleClaimed } from "../src/merkle-redeem"
import { CustomEvents } from "./merkle-redeem-utils"

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

  // ---------------------------
  // --- Test Claimed entity ---
  // ---------------------------

  test(
    "Test Claimed entity data on claimPeriod() transaction",
    () => {
      // Simulate claimPeriod() transaction
      const newClaimPeriodEvent = CustomEvents.createClaimPeriodEvent()
      handleClaimed(newClaimPeriodEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newClaimPeriodEvent)
      const idString = id.toHexString()
      const recipient = Address.fromHexString(
        "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
      ).toHexString()
      const balance = BigInt.fromString("570759569000000000000")
      const period = BigInt.fromString("0")
      const balancePerPeriod = [balance]
      const periods = [period]
      const periodsLength = 1 // In claimPeriod() transactions, always 1 period is fixed

      // Validate entity count
      assert.entityCount("Claimed", 1)

      // Validate recipient
      assert.fieldEquals("Claimed", idString, "recipient", recipient)

      // Validate balance
      assert.fieldEquals("Claimed", idString, "balance", balance.toString())

      // Validate balancePerPeriod
      assert.fieldEquals(
        "Claimed",
        idString,
        "balancePerPeriod",
        arrayToString(balancePerPeriod)
      )

      // Validate periods
      assert.fieldEquals("Claimed", idString, "periods", arrayToString(periods))

      // Validate periodsLength
      assert.fieldEquals(
        "Claimed",
        idString,
        "periodsLength",
        periodsLength.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test Claimed entity data on claimPeriods() (single period)",
    () => {
      // Simulate claimPeriods() (single period) transaction
      const newClaimPeriodsSingleEvent =
        CustomEvents.createClaimPeriodsSingleEvent()
      handleClaimed(newClaimPeriodsSingleEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newClaimPeriodsSingleEvent)
      const idString = id.toHexString()
      const recipient = Address.fromHexString(
        "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
      ).toHexString()
      const balancePerPeriod = ["20000000000000000000"].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
      const periods = ["0"].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("Claimed", 1)

      // Validate recipient
      assert.fieldEquals("Claimed", idString, "recipient", recipient)

      // Validate balance
      assert.fieldEquals(
        "Claimed",
        idString,
        "balance",
        totalBalance.toString()
      )

      // Validate balancePerPeriod
      assert.fieldEquals(
        "Claimed",
        idString,
        "balancePerPeriod",
        arrayToString(balancePerPeriod)
      )

      // Validate periods
      assert.fieldEquals("Claimed", idString, "periods", arrayToString(periods))

      // Validate periodsLength
      assert.fieldEquals(
        "Claimed",
        idString,
        "periodsLength",
        periodsLength.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test Claimed entity data on claimPeriods() (multiple periods)",
    () => {
      // Simulate claimPeriods() (multiple periods) transaction
      const newClaimPeriodsMultipleEvent =
        CustomEvents.createClaimPeriodsMultipleEvent()
      handleClaimed(newClaimPeriodsMultipleEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newClaimPeriodsMultipleEvent)
      const idString = id.toHexString()
      const recipient = Address.fromHexString(
        "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
      ).toHexString()
      const balancePerPeriod = [
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
      const periods = [
        "25",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13"
      ].map<BigInt>((str) => BigInt.fromString(str))

      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("Claimed", 1)

      // Validate recipient
      assert.fieldEquals("Claimed", idString, "recipient", recipient)

      // Validate balance
      assert.fieldEquals(
        "Claimed",
        idString,
        "balance",
        totalBalance.toString()
      )

      // Validate balancePerPeriod
      assert.fieldEquals(
        "Claimed",
        idString,
        "balancePerPeriod",
        arrayToString(balancePerPeriod)
      )

      // Validate periods
      assert.fieldEquals("Claimed", idString, "periods", arrayToString(periods))

      // Validate periodsLength
      assert.fieldEquals(
        "Claimed",
        idString,
        "periodsLength",
        periodsLength.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test Claimed entity data on execute() and other transactions",
    () => {
      // Simulate execute() transaction
      const newExecuteEvent = CustomEvents.createExecuteEvent()
      handleClaimed(newExecuteEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newExecuteEvent)
      const idString = id.toHexString()
      const recipient = Address.fromHexString(
        "0x3021B1A8bB7d73d0afaA3537040EfAb630dB2958"
      ).toHexString()
      const balance = BigInt.fromString("1000000000000000000000")
      const balancePerPeriod = [balance]
      // Employing u64.MAX_VALUE as the unknown period value
      const periods = [u64.MAX_VALUE].map<BigInt>((num) => BigInt.fromU64(num))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("Claimed", 1)

      // Validate recipient
      assert.fieldEquals("Claimed", idString, "recipient", recipient)

      // Validate balance
      assert.fieldEquals("Claimed", idString, "balance", balance.toString())

      // Validate balancePerPeriod
      assert.fieldEquals(
        "Claimed",
        idString,
        "balancePerPeriod",
        arrayToString(balancePerPeriod)
      )

      // Validate periods
      assert.fieldEquals("Claimed", idString, "periods", arrayToString(periods))

      // Validate periodsLength
      assert.fieldEquals(
        "Claimed",
        idString,
        "periodsLength",
        periodsLength.toString()
      )
    },
    false // Expected success
  )

  // ------------------------------------
  // --- Test ClaimedPerPeriod entity ---
  // ------------------------------------

  test(
    "Test ClaimedPerPeriod entity data on claimPeriod() transaction",
    () => {
      // Simulate claimPeriod() transaction
      const newClaimPeriodEvent = CustomEvents.createClaimPeriodEvent()
      handleClaimed(newClaimPeriodEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newClaimPeriodEvent)
      const recipient = Address.fromHexString(
        "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
      ).toHexString()
      const balance = BigInt.fromString("570759569000000000000")
      const period = BigInt.fromString("0")
      const balancePerPeriod = [balance]
      const periods = [period]
      const periodsLength = 1 // In claimPeriod() transactions, always 1 period is fixed

      // Validate entity count
      assert.entityCount("ClaimedPerPeriod", periodsLength)

      for (let i: i32 = 0; i < periodsLength; i++) {
        // Validate recipient
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "recipient",
          recipient
        )

        // Validate balance
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "balance",
          balancePerPeriod[i].toString()
        )

        // Validate period
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          periods[i].toString()
        )
      }
    },
    false // Expected success
  )

  test(
    "Test ClaimedPerPeriod entity data on claimPeriods() (single period)",
    () => {
      // Simulate claimPeriods() (single period) transaction
      const newClaimPeriodsSingleEvent =
        CustomEvents.createClaimPeriodsSingleEvent()
      handleClaimed(newClaimPeriodsSingleEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newClaimPeriodsSingleEvent)
      const recipient = Address.fromHexString(
        "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
      ).toHexString()
      const balancePerPeriod = ["20000000000000000000"].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
      const periods = ["0"].map<BigInt>((str) => BigInt.fromString(str))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("ClaimedPerPeriod", periodsLength)

      for (let i: i32 = 0; i < periodsLength; i++) {
        // Validate recipient
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "recipient",
          recipient
        )

        // Validate balance
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "balance",
          balancePerPeriod[i].toString()
        )

        // Validate period
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          periods[i].toString()
        )
      }
    },
    false // Expected success
  )

  test(
    "Test ClaimedPerPeriod entity data on claimPeriods() (multiple periods)",
    () => {
      // Simulate claimPeriods() (multiple periods) transaction
      const newClaimPeriodsMultipleEvent =
        CustomEvents.createClaimPeriodsMultipleEvent()
      handleClaimed(newClaimPeriodsMultipleEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newClaimPeriodsMultipleEvent)
      const recipient = Address.fromHexString(
        "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
      ).toHexString()
      const balancePerPeriod = [
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
      const periods = [
        "25",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13"
      ].map<BigInt>((str) => BigInt.fromString(str))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("ClaimedPerPeriod", periodsLength)

      for (let i: i32 = 0; i < periodsLength; i++) {
        // Validate recipient
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "recipient",
          recipient
        )

        // Validate balance
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "balance",
          balancePerPeriod[i].toString()
        )

        // Validate period
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          periods[i].toString()
        )
      }
    },
    false // Expected success
  )

  test(
    "Test ClaimedPerPeriod entity data on execute() and other transactions",
    () => {
      // Simulate execute() transaction
      const newExecuteEvent = CustomEvents.createExecuteEvent()
      handleClaimed(newExecuteEvent)

      // Configure claimPeriod() transaction parameters
      const id = getEventId(newExecuteEvent)
      const recipient = Address.fromHexString(
        "0x3021B1A8bB7d73d0afaA3537040EfAb630dB2958"
      ).toHexString()
      const balance = BigInt.fromString("1000000000000000000000")
      const balancePerPeriod = [balance]
      // Employing u64.MAX_VALUE as the unknown period value
      const periods = [u64.MAX_VALUE].map<BigInt>((num) => BigInt.fromU64(num))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("ClaimedPerPeriod", periodsLength)

      for (let i: i32 = 0; i < periodsLength; i++) {
        // Validate recipient
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "recipient",
          recipient
        )

        // Validate balance
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "balance",
          balancePerPeriod[i].toString()
        )

        // Validate period
        assert.fieldEquals(
          "ClaimedPerPeriod",
          concatIndex(id, i).toHexString(),
          "period",
          periods[i].toString()
        )
      }
    },
    false // Expected success
  )

  // --------------------------------
  // --- Test TotalClaimed entity ---
  // --------------------------------

  test(
    "Test TotalClaimed entity data on claimPeriod() transaction",
    () => {
      // Simulate claimPeriod() transaction
      const newClaimPeriodEvent = CustomEvents.createClaimPeriodEvent()
      handleClaimed(newClaimPeriodEvent)

      // Configure claimPeriod() transaction parameters
      const balance = BigInt.fromString("570759569000000000000")
      const periodsLength = 1 // In claimPeriod() transactions, always 1 period is fixed

      // Validate entity count
      assert.entityCount("TotalClaimed", 1)

      // Validate countClaimed
      assert.fieldEquals("TotalClaimed", one, "countClaimed", "1")

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "countPeriod",
        periodsLength.toString()
      ) // In claimPeriod() transactions, always 1 period is fixed

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "totalBalance",
        balance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimed entity data on claimPeriods() (single period)",
    () => {
      // Simulate claimPeriods() (single period) transaction
      const newClaimPeriodsSingleEvent =
        CustomEvents.createClaimPeriodsSingleEvent()
      handleClaimed(newClaimPeriodsSingleEvent)

      // Configure claimPeriod() transaction parameters
      const balancePerPeriod = ["20000000000000000000"].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
      const periods = ["0"].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimed", 1)

      // Validate countClaimed
      assert.fieldEquals("TotalClaimed", one, "countClaimed", "1")

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "countPeriod",
        periodsLength.toString()
      ) // In claimPeriod() transactions, always 1 period is fixed

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "totalBalance",
        totalBalance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimed entity data on claimPeriods() (multiple periods)",
    () => {
      // Simulate claimPeriods() (multiple periods) transaction
      const newClaimPeriodsMultipleEvent =
        CustomEvents.createClaimPeriodsMultipleEvent()
      handleClaimed(newClaimPeriodsMultipleEvent)

      // Configure claimPeriod() transaction parameters
      const balancePerPeriod = [
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
      const periods = [
        "25",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13"
      ].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimed", 1)

      // Validate countClaimed
      assert.fieldEquals("TotalClaimed", one, "countClaimed", "1")

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "countPeriod",
        periodsLength.toString()
      ) // In claimPeriod() transactions, always 1 period is fixed

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "totalBalance",
        totalBalance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimed entity data on execute() and other transactions",
    () => {
      // Simulate execute() transaction
      const newExecuteEvent = CustomEvents.createExecuteEvent()
      handleClaimed(newExecuteEvent)

      // Configure claimPeriod() transaction parameters
      const balance = BigInt.fromString("1000000000000000000000")
      // Employing u64.MAX_VALUE as the unknown period value
      const periods = [u64.MAX_VALUE].map<BigInt>((num) => BigInt.fromU64(num))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimed", 1)

      // Validate countClaimed
      assert.fieldEquals("TotalClaimed", one, "countClaimed", "1")

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "countPeriod",
        periodsLength.toString()
      ) // In claimPeriod() transactions, always 1 period is fixed

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimed",
        one,
        "totalBalance",
        balance.toString()
      )
    },
    false // Expected success
  )

  // ---------------------------------------
  // --- Test TotalClaimedPerFrom entity ---
  // ---------------------------------------

  test(
    "Test TotalClaimedPerFrom entity data on claimPeriod() transaction",
    () => {
      // Simulate claimPeriod() transaction
      const newClaimPeriodEvent = CustomEvents.createClaimPeriodEvent()
      handleClaimed(newClaimPeriodEvent)

      // Configure claimPeriod() transaction parameters
      const from = Address.fromHexString(
        "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
      ).toHexString()
      const balance = BigInt.fromString("570759569000000000000")
      const periodsLength = 1 // In claimPeriod() transactions, always 1 period is fixed

      // Validate entity count
      assert.entityCount("TotalClaimedPerFrom", 1)

      // Validate from
      assert.fieldEquals("TotalClaimedPerFrom", from, "from", from) // The from as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "totalBalance",
        balance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimedPerFrom entity data on claimPeriods() (single period)",
    () => {
      // Simulate claimPeriods() (single period) transaction
      const newClaimPeriodsSingleEvent =
        CustomEvents.createClaimPeriodsSingleEvent()
      handleClaimed(newClaimPeriodsSingleEvent)

      // Configure claimPeriod() transaction parameters
      const from = Address.fromHexString(
        "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
      ).toHexString()
      const balancePerPeriod = ["20000000000000000000"].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
      const periods = ["0"].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimedPerFrom", 1)

      // Validate from
      assert.fieldEquals("TotalClaimedPerFrom", from, "from", from) // The from as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "totalBalance",
        totalBalance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimedPerFrom entity data on claimPeriods() (multiple periods)",
    () => {
      // Simulate claimPeriods() (multiple periods) transaction
      const newClaimPeriodsMultipleEvent =
        CustomEvents.createClaimPeriodsMultipleEvent()
      handleClaimed(newClaimPeriodsMultipleEvent)

      // Configure claimPeriod() transaction parameters
      const from = Address.fromString(
        "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
      ).toHexString()
      const balancePerPeriod = [
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
      const periods = [
        "25",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13"
      ].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimedPerFrom", 1)

      // Validate from
      assert.fieldEquals("TotalClaimedPerFrom", from, "from", from) // The from as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "totalBalance",
        totalBalance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimedPerFrom entity data on execute() and other transactions",
    () => {
      // Simulate execute() transaction
      const newExecuteEvent = CustomEvents.createExecuteEvent()
      handleClaimed(newExecuteEvent)

      // Configure claimPeriod() transaction parameters
      const from = Address.fromString(
        "0x4eD51224672aaD35d50F2ee49b0fdC9958618d38"
      ).toHexString()
      const balance = BigInt.fromString("1000000000000000000000")
      // Employing u64.MAX_VALUE as the unknown period value
      const periods = [u64.MAX_VALUE].map<BigInt>((num) => BigInt.fromU64(num))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimedPerFrom", 1)

      // Validate from
      assert.fieldEquals("TotalClaimedPerFrom", from, "from", from) // The from as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerFrom",
        from,
        "totalBalance",
        balance.toString()
      )
    },
    false // Expected success
  )

  // --------------------------------------------
  // --- Test TotalClaimedPerRecipient entity ---
  // --------------------------------------------

  test(
    "Test TotalClaimedPerRecipient entity data on claimPeriod() transaction",
    () => {
      // Simulate claimPeriod() transaction
      const newClaimPeriodEvent = CustomEvents.createClaimPeriodEvent()
      handleClaimed(newClaimPeriodEvent)

      // Configure claimPeriod() transaction parameters
      const recipient = Address.fromHexString(
        "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
      ).toHexString()
      const balance = BigInt.fromString("570759569000000000000")
      const periodsLength = 1 // In claimPeriod() transactions, always 1 period is fixed

      // Validate entity count
      assert.entityCount("TotalClaimedPerRecipient", 1)

      // Validate recipient
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "recipient",
        recipient
      ) // The recipient as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "totalBalance",
        balance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimedPerRecipient entity data on claimPeriods() (single period)",
    () => {
      // Simulate claimPeriods() (single period) transaction
      const newClaimPeriodsSingleEvent =
        CustomEvents.createClaimPeriodsSingleEvent()
      handleClaimed(newClaimPeriodsSingleEvent)

      // Configure claimPeriod() transaction parameters
      const recipient = Address.fromHexString(
        "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
      ).toHexString()
      const balancePerPeriod = ["20000000000000000000"].map<BigInt>((str) =>
        BigInt.fromString(str)
      )
      const periods = ["0"].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimedPerRecipient", 1)

      // Validate recipient
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "recipient",
        recipient
      ) // The recipient as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "totalBalance",
        totalBalance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimedPerRecipient entity data on claimPeriods() (multiple periods)",
    () => {
      // Simulate claimPeriods() (multiple periods) transaction
      const newClaimPeriodsMultipleEvent =
        CustomEvents.createClaimPeriodsMultipleEvent()
      handleClaimed(newClaimPeriodsMultipleEvent)

      // Configure claimPeriod() transaction parameters
      const recipient = Address.fromHexString(
        "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
      ).toHexString()
      const balancePerPeriod = [
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
      const periods = [
        "25",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13"
      ].map<BigInt>((str) => BigInt.fromString(str))
      const totalBalance = balancePerPeriod.reduce<BigInt>(
        (x, y) => x.plus(y),
        BigInt.fromString("0")
      )
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimedPerRecipient", 1)

      // Validate recipient
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "recipient",
        recipient
      ) // The recipient as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "totalBalance",
        totalBalance.toString()
      )
    },
    false // Expected success
  )

  test(
    "Test TotalClaimedPerRecipient entity data on execute() and other transactions",
    () => {
      // Simulate execute() transaction
      const newExecuteEvent = CustomEvents.createExecuteEvent()
      handleClaimed(newExecuteEvent)

      // Configure claimPeriod() transaction parameters
      const recipient = Address.fromHexString(
        "0x3021B1A8bB7d73d0afaA3537040EfAb630dB2958"
      ).toHexString()
      const balance = BigInt.fromString("1000000000000000000000")
      // Employing u64.MAX_VALUE as the unknown period value
      const periods = [u64.MAX_VALUE].map<BigInt>((num) => BigInt.fromU64(num))
      const periodsLength = periods.length

      // Validate entity count
      assert.entityCount("TotalClaimedPerRecipient", 1)

      // Validate recipient
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "recipient",
        recipient
      ) // The recipient as this entity id

      // Validate countPeriod
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "countPeriod",
        periodsLength.toString()
      )

      // Validate totalBalance
      assert.fieldEquals(
        "TotalClaimedPerRecipient",
        recipient,
        "totalBalance",
        balance.toString()
      )
    },
    false // Expected success
  )
})
