import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import {
  Claimed,
  OwnerChanged,
  OwnerNominated
} from "../generated/MerkleRedeem/MerkleRedeem"

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

export function createclaimPeriodEvent(
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

  log.info("claimedEvent.transaction.from: {}", [
    claimedEvent.transaction.from.toHexString()
  ])
  log.info("claimedEvent.transaction.input: {}", [
    claimedEvent.transaction.input.toHexString()
  ])

  // TODO: Add new event for claimPeriod and claimPeriods
  // Refer: node_modules/matchstick-as/assembly/defaults.ts
  //   new ethereum.Event()

  // Refer: https://etherscan.io/tx/0x126017fe53cb762222313c4fe92de096544ed325d32b472f9c302cd992e628f2
  //   claimedEvent.transaction.from = Address.fromHexString(
  //     "0x90e5e30d3A891693d6822e06b52562Dd4dBacC83"
  //   )
  //   claimedEvent.transaction.input = Bytes.fromHexString(
  //     "0x8dbfd5e800000000000000000000000090e5e30d3a891693d6822e06b52562dd4dbacc83000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001ef0e153fde00e100000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000013410749d4d1c1126ad8dc459d1ccf1ee40017036511f81fddb0f3e02c35d7cd60d3b4489831eb87c1a1644cf1bdbff685dce85a50df7cd3daa0cdbde9b1e164a29f4af8f41a19580999867d417f42506d3dec72577b8d0202704b8522ac1b93f50ad867d40e5acd890c136b03334a7bacd79e84a69dbf0f8ccf2011045a8c50b84faf10c2555d5b3f04f22d9c06c1ed10f9bd7ca5795a95463d473a8d4e8bcd6746e85f7e5e688ffd50f6106db8f0891831f7b2b952a8d79f8d172106ead63fb07d60e16595d5d1eea5a8c41940f6658fffea1ad46aef3a7c24b4666d9f0938520677784c34e60221e86c4ddafaf316fb8fe8b90412f1165e6e1c6e7c3cdbc2b94554589fc8b4e5c74daf51648d032b1855fdd88fc7b5e329ac11a4835600fb7da497bc3cfb7e6606f464b93b01a54748c07d62d81436210fdc723f1f7278fc191b62e41d26203ae1a413086d4b92cd5f7941e87e811a6a31e7e76bd341c7a8ee36831029ce5be0064b6488e337ff2f30cf9774ceebe904cb8b9a9aa4f0a492bb5f0ff28ad11af57e6e9dd76529fa6da1b8a33c1f3d4461117ba33c9e358b2fb8d86be693dbfd5e331c594317d60e63990d041e0323df453513421a3852f406b92bb78501010a85da7ad080af9da3614ae445e99717a526d9b975ed35a3d3d63f48fc0eb72563838064bcf2f5b5bf5214d5ee99995d2e8540803e9ca9587531652a547acaeac531fc4f2f44caaab68da04734a0c0daaeca1c646063ec6d2b056237922012f937af7e2abdde29328b3b26207e83557b5ec493ff86acb06da8d1f82e43f3260bf0c3bd1be8573379e88b5692eca73ffab33d94ed843ad437fd4835"
  //   )

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
