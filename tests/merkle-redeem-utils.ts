import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import {
  Claimed,
  OwnerChanged,
  OwnerNominated
} from "../generated/MerkleRedeem/MerkleRedeem"
import {
  newMockEvent as customMockEvent,
  CustomTransactions,
  newTransaction
} from "./newMockEvent"

export function createClaimedEvent(
  recipient: Address,
  balance: BigInt
): Claimed {
  let claimedEvent = changetype<Claimed>(newMockEvent())

  claimedEvent.parameters = new Array()

  claimedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  claimedEvent.parameters.push(
    new ethereum.EventParam(
      "balance",
      ethereum.Value.fromUnsignedBigInt(balance)
    )
  )

  return claimedEvent
}

export function createOwnerChangedEvent(
  oldOwner: Address,
  newOwner: Address
): OwnerChanged {
  let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent())

  ownerChangedEvent.parameters = new Array()

  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerChangedEvent
}

export function createOwnerNominatedEvent(newOwner: Address): OwnerNominated {
  let ownerNominatedEvent = changetype<OwnerNominated>(newMockEvent())

  ownerNominatedEvent.parameters = new Array()

  ownerNominatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerNominatedEvent
}

// Custom events
export namespace CustomEvents {
  // Refer: https://etherscan.io/tx/0x126017fe53cb762222313c4fe92de096544ed325d32b472f9c302cd992e628f2#eventlog
  export const createClaimPeriodEvent = (): Claimed => {
    const recipient = Address.fromString(
      "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
    )
    const balance = BigInt.fromString("570759569000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(CustomTransactions.newClaimPeriodTransaction())
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }

  // Refer: https://etherscan.io/tx/0x8b510abb60acf348aff1b612764160c24b74274a1bb651d615eb914fd63fddf3#eventlog
  export const createClaimPeriodsSingleEvent = (): Claimed => {
    const recipient = Address.fromString(
      "0x32BF0Ea129625Be1EF65072eb0115CB91F4182Ba"
    )
    const balance = BigInt.fromString("20000000000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(CustomTransactions.newClaimPeriodsSingleTransaction())
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }

  // Refer: https://etherscan.io/tx/0xa4262ddcb02b29be1da9db6c4e5ad33d3a881f9bce077eaebea6f85b617f12b4#eventlog
  export const createClaimPeriodsMultipleEvent = (): Claimed => {
    const recipient = Address.fromString(
      "0x2250dd2642F60730f5FDBfdd978626E61EBe864e"
    )
    const balance = BigInt.fromString("564572885000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(CustomTransactions.newClaimPeriodsMultipleTransaction())
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }

  // Refer: https://etherscan.io/tx/0xe78ecb606b56b4393acf9b46f0ceb53edfc4fabf23ee6c4d6c8d9d90aa41dc53#eventlog
  export const createExecuteEvent = (): Claimed => {
    const recipient = Address.fromString(
      "0x3021B1A8bB7d73d0afaA3537040EfAb630dB2958"
    )
    const balance = BigInt.fromString("1000000000000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(CustomTransactions.newExecuteTransaction())
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }

  // Refer: https://etherscan.io/tx/0xc304f3eeb8a9f438697d83c5fa9c7028462ba7eb343b8589140829d65639c627#eventlog
  export const createUnknownEvent_0xa2d41b9e = (): Claimed => {
    const recipient = Address.fromString(
      "0x718811e2d1170db844d0c5de6D276b299f2916a9"
    )
    const balance = BigInt.fromString("1000000000000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(
        CustomTransactions.newUnknownInputTransaction_0xa2d41b9e()
      )
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }

  // Refer: https://etherscan.io/tx/0x8e434a79bdf9fdee70dfc77ef6e1e23b9d3ef076593999fba2cdd15f909748d8#eventlog
  export const createUnknownEvent_0x477564b4 = (): Claimed => {
    const recipient = Address.fromString(
      "0xD6952dd30A4f699213F60386C7c45EB2801a7509"
    )
    const balance = BigInt.fromString("70000000000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(
        CustomTransactions.newUnknownInputTransaction_0x477564b4()
      )
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }

  // Refer: https://etherscan.io/tx/0x56e9da9f1fecb79d5e1d6c6fd601b89ee91544652d768e2050f4871b86360e15#eventlog
  export const createUnknownEvent_0x8607c220 = (): Claimed => {
    const recipient = Address.fromString(
      "0x10FE00249a0ca7b827c9D4072686434165263bF9"
    )
    const balance = BigInt.fromString("20000000000000000000")

    const claimedEvent = changetype<Claimed>(
      customMockEvent(
        CustomTransactions.newUnknownInputTransaction_0x8607c220()
      )
    )
    claimedEvent.parameters = new Array()
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "recipient",
        ethereum.Value.fromAddress(recipient)
      )
    )
    claimedEvent.parameters.push(
      new ethereum.EventParam(
        "balance",
        ethereum.Value.fromUnsignedBigInt(balance)
      )
    )
    return claimedEvent
  }
}
