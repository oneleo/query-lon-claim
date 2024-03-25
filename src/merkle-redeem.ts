import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Claimed as ClaimedEvent,
  OwnerChanged as OwnerChangedEvent,
  OwnerNominated as OwnerNominatedEvent
} from "../generated/MerkleRedeem/MerkleRedeem"
import { Claimed, OwnerChanged, OwnerNominated } from "../generated/schema"

export function handleClaimed(event: ClaimedEvent): void {
  let entity = new Claimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.recipient = event.params.recipient
  entity.balance = event.params.balance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  log.info("[log] Claimed event transaction hash: {}", [
    entity.transactionHash.toHexString()
  ])

  // Get transaction input and calldata
  const input = event.transaction.input
  const calldata = Bytes.fromUint8Array(input.subarray(4, input.length))

  log.info("[log] claimPeriods/claimPeriods hash: {}, input: {}", [
    entity.transactionHash.toHexString(),
    input.toHexString()
  ])
  log.info("[log] claimPeriods/claimPeriods hash: {}, calldata: {}", [
    entity.transactionHash.toHexString(),
    calldata.toHexString()
  ])

  // TODO: decode calldata
  // Refer: https://thegraph.com/docs/en/developing/graph-ts/api/#encodingdecoding-abi
  // Refer: https://github.com/graphprotocol/graph-node/blob/6a7806cc465949ebb9e5b8269eeb763857797efc/tests/integration-tests/host-exports/src/mapping.ts#L72

  entity.save()
}

export function handleOwnerChanged(event: OwnerChangedEvent): void {
  let entity = new OwnerChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldOwner = event.params.oldOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  log.info("[log] OwnerChanged event transaction hash: {}", [
    entity.transactionHash.toHexString()
  ])

  entity.save()
}

export function handleOwnerNominated(event: OwnerNominatedEvent): void {
  let entity = new OwnerNominated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  log.info("[log] OwnerNominated event transaction hash: {}", [
    entity.transactionHash.toHexString()
  ])

  entity.save()
}
