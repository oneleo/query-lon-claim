import {
  Address,
  bigInt,
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
  log,
  store
} from "@graphprotocol/graph-ts"
import {
  Claimed as ClaimedEvent,
  OwnerChanged as OwnerChangedEvent,
  OwnerNominated as OwnerNominatedEvent
} from "../generated/MerkleRedeem/MerkleRedeem"
import {
  ClaimedByPeriod as ClaimedByPeriodEntity,
  Claimed as ClaimedEntity,
  ClaimedTotalByFrom as ClaimedTotalByFromEntity,
  ClaimedTotalByRecipient as ClaimedTotalByRecipientEntity,
  ClaimedTotal as ClaimedTotalEntity,
  OwnerChanged as OwnerChangedEntity,
  OwnerNominated as OwnerNominatedEntity
} from "../generated/schema"

// In The Graph, setting string in an Enumeration is still seen as i32 type by the compiler.
export const enum Method {
  claimPeriod,
  claimPeriods,
  execute,
  unknown
}

export namespace MethodId {
  // function: claimPeriod(address recipient, uint256 period, uint256 balance, bytes32[] memory proof)
  export const claimPeriod = "0x8dbfd5e8" // = keccak256(abi.encodePacked("claimPeriod(address,uint256,uint256,bytes32[])"))
  // function: function claimPeriods(address recipient, Claim[] memory claims)
  //   ∟ struct Claim{uint256 period; uint256 balance; bytes32[] proof;}
  export const claimPeriods = "0xb03d8c2f" // = keccak256(abi.encodePacked("claimPeriods(address,(uint256,uint256,bytes32[])[])"))
  // function: execute(address _target, bytes _data)
  export const execute = "0x1cff79cd" // = keccak256(abi.encodePacked("execute(address,bytes)"))
}

// Define the enumeration content within the subgraph to prevent string input errors,
// which may only arise after deployment to Subgraph Studio and during indexing.
export namespace MethodName {
  export const claimPeriod = "claimPeriod"
  export const claimPeriods = "claimPeriods"
  export const execute = "execute"
  export const unknown = "unknown"
}

export const getEventId = (e: ethereum.Event): Bytes => {
  const dashBytes = Bytes.fromUTF8("-")
  const blockHash = e.block.hash
  const transactionHash = e.transaction.hash
  const logIndex = e.logIndex
  return blockHash
    .concat(dashBytes)
    .concat(transactionHash)
    .concat(dashBytes)
    .concatI32(logIndex.toI32())
}

export const concatIndex = (id: Bytes, index: i32): Bytes => {
  return id.concat(Bytes.fromUTF8("-")).concat(Bytes.fromI32(index))
}

export const getMethod = (methodId: Bytes): Method => {
  if (methodId.equals(Bytes.fromHexString(MethodId.claimPeriod))) {
    return Method.claimPeriod
  }
  if (methodId.equals(Bytes.fromHexString(MethodId.claimPeriods))) {
    return Method.claimPeriods
  }
  if (methodId.equals(Bytes.fromHexString(MethodId.execute))) {
    return Method.execute
  }
  return Method.unknown
}

export const getMethodName = (methodId: Bytes): string => {
  if (methodId.equals(Bytes.fromHexString(MethodId.claimPeriod))) {
    return MethodName.claimPeriod
  }
  if (methodId.equals(Bytes.fromHexString(MethodId.claimPeriods))) {
    return MethodName.claimPeriods
  }
  if (methodId.equals(Bytes.fromHexString(MethodId.execute))) {
    return MethodName.execute
  }
  return MethodName.unknown
}

export const toTuple = (calldata: Uint8Array): Bytes => {
  // Prepend a "tuple" prefix (function params are arrays, not tuples)
  // Refer: https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays
  const tuplePrefix = ByteArray.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000020"
  )

  const calldataAsTuple = new Uint8Array(tuplePrefix.length + calldata.length)

  // Concat prefix & original calldata
  calldataAsTuple.set(tuplePrefix, 0)
  calldataAsTuple.set(calldata, tuplePrefix.length)

  return Bytes.fromUint8Array(calldataAsTuple)
}

export function handleClaimed(event: ClaimedEvent): void {
  const id = getEventId(event)
  //   const id = event.transaction.hash.concatI32(event.logIndex.toI32())
  const zero = BigInt.fromU32(0)
  const one = Bytes.fromI32(1)
  const oneBigInt = BigInt.fromI32(1)

  const blockNumber = event.block.number
  const timestamp = event.block.timestamp
  const transactionHash = event.transaction.hash
  const transactionInput = event.transaction.input
  const from = changetype<Bytes>(event.transaction.from)
  const methodId = Bytes.fromUint8Array(transactionInput.subarray(0, 4))
  const calldata = transactionInput.subarray(4)
  const calldataAsTuple = toTuple(calldata)

  const recipient = changetype<Bytes>(event.params.recipient)
  const balance = event.params.balance
  const method = getMethod(methodId)
  const methodName = getMethodName(methodId)

  // ----------------------------------
  // --- Update ClaimedTotal entity ---
  // ----------------------------------

  let claimedTotalEntity = ClaimedTotalEntity.load(one)
  // In the Subgraph handler, using === always returns false. Please use == for comparison.
  if (claimedTotalEntity == null) {
    claimedTotalEntity = new ClaimedTotalEntity(one)
    claimedTotalEntity.totalBalance = zero
    claimedTotalEntity.totalClaimed = zero
  }
  claimedTotalEntity.totalBalance =
    claimedTotalEntity.totalBalance.plus(balance)
  claimedTotalEntity.totalClaimed =
    claimedTotalEntity.totalClaimed.plus(oneBigInt)

  // Save the entity to the store
  claimedTotalEntity.save()

  // -----------------------------
  // --- Create Claimed entity ---
  // -----------------------------

  const claimedEntity = new ClaimedEntity(id)
  claimedEntity.from = from
  claimedEntity.recipient = recipient
  claimedEntity.balance = balance
  claimedEntity.blockNumber = blockNumber
  claimedEntity.blockTimestamp = timestamp
  claimedEntity.transactionHash = transactionHash
  claimedEntity.transactionMethodId = methodId
  claimedEntity.transactionMethodName = methodName
  claimedEntity.periods = []
  claimedEntity.balances = []

  const periods: Array<BigInt | null> = []
  const balances: Array<BigInt> = []
  // Because the AssemblyScript compiler struggles with null values, two non-null arrays have been added to store known methodId values.
  const nonNullPeriods: Array<BigInt> = []
  const nonNullBalances: Array<BigInt> = []

  // Currently, the switch conditions (case values) are implicitly converted to u32, i.e. switching over strings or similar is not yet supported.
  // Refer: https://www.assemblyscript.org/examples/snippets.html#switch-case
  switch (method) {
    case Method.claimPeriod: {
      const decode = ethereum.decode(
        "(address,uint256,uint256,bytes32[])",
        calldataAsTuple
      )
      if (decode) {
        const claimPeriod = decode.toTuple()
        periods.push(claimPeriod[1].toBigInt())
        balances.push(claimPeriod[2].toBigInt())
        nonNullPeriods.push(claimPeriod[1].toBigInt())
        nonNullBalances.push(claimPeriod[2].toBigInt())
      }
      break
    }
    case Method.claimPeriods: {
      const decode = ethereum.decode(
        "(address,(uint256,uint256,bytes32[])[])",
        calldataAsTuple
      )
      if (decode) {
        const claimPeriods = decode.toTuple()
        const claims = claimPeriods[1].toTupleArray<ethereum.Tuple>()
        for (let i = 0; i < claims.length; i++) {
          periods.push(claims[i][0].toBigInt())
          balances.push(claims[i][1].toBigInt())
          nonNullPeriods.push(claims[i][0].toBigInt())
          nonNullBalances.push(claims[i][1].toBigInt())
        }
      }
      break
    }
    case Method.execute: {
      claimedEntity.transactionMethodName = MethodName.execute
      periods.push(null)
      balances.push(balance)
      // Employing i32.MAX_VALUE as the unknown period value.
      nonNullPeriods.push(BigInt.fromI32(i32.MAX_VALUE))
      nonNullBalances.push(balance)
      break
    }
    default: {
      claimedEntity.transactionMethodName = MethodName.unknown
      periods.push(null)
      balances.push(balance)
      // Employing i32.MAX_VALUE as the unknown period value.
      nonNullPeriods.push(BigInt.fromI32(i32.MAX_VALUE))
      nonNullBalances.push(balance)
      break
    }
  }
  const periodsLength = periods.length

  claimedEntity.periodsLength = BigInt.fromI32(periodsLength)
  claimedEntity.periods = nonNullPeriods
  claimedEntity.balances = nonNullBalances

  // Save the entity to the store
  claimedEntity.save()

  // ----------------------------------------
  // --- Update ClaimedTotalByFrom entity ---
  // ----------------------------------------

  let claimedTotalByFromEntity = ClaimedTotalByFromEntity.load(from)
  if (claimedTotalByFromEntity == null) {
    claimedTotalByFromEntity = new ClaimedTotalByFromEntity(from)
    claimedTotalByFromEntity.from = from
    claimedTotalByFromEntity.totalPeriod = zero
    claimedTotalByFromEntity.totalBalance = zero
  }
  claimedTotalByFromEntity.totalBalance =
    claimedTotalByFromEntity.totalBalance.plus(balance)
  claimedTotalByFromEntity.totalPeriod =
    claimedTotalByFromEntity.totalPeriod.plus(BigInt.fromI32(periodsLength))

  // Save the entity to the store
  claimedTotalByFromEntity.save()

  // ---------------------------------------------
  // --- Update claimedTotalByRecipient entity ---
  // ---------------------------------------------

  let claimedTotalByRecipientEntity =
    ClaimedTotalByRecipientEntity.load(recipient)
  if (claimedTotalByRecipientEntity == null) {
    claimedTotalByRecipientEntity = new ClaimedTotalByRecipientEntity(recipient)
    claimedTotalByRecipientEntity.recipient = recipient
    claimedTotalByRecipientEntity.totalPeriod = zero
    claimedTotalByRecipientEntity.totalBalance = zero
  }
  claimedTotalByRecipientEntity.totalBalance =
    claimedTotalByRecipientEntity.totalBalance.plus(balance)
  claimedTotalByRecipientEntity.totalPeriod =
    claimedTotalByRecipientEntity.totalPeriod.plus(
      BigInt.fromI32(periodsLength)
    )

  // Save the entity to the store
  claimedTotalByRecipientEntity.save()

  // -------------------------------------
  // --- Create ClaimedByPeriod entity ---
  // -------------------------------------

  for (let i: i32 = 0; i < periodsLength; i++) {
    const idWithIndex = concatIndex(id, i)
    // Create ClaimedByRecipient entity
    const claimedByPeriodEntity = new ClaimedByPeriodEntity(idWithIndex)
    claimedByPeriodEntity.from = from
    claimedByPeriodEntity.recipient = recipient
    claimedByPeriodEntity.period = periods[i]
    claimedByPeriodEntity.balance = balances[i]
    claimedByPeriodEntity.blockNumber = blockNumber
    claimedByPeriodEntity.blockTimestamp = timestamp
    claimedByPeriodEntity.transactionHash = transactionHash
    claimedByPeriodEntity.transactionMethodId = methodId
    claimedByPeriodEntity.transactionMethodName = methodName

    // Save the entity to the store
    claimedByPeriodEntity.save()

    // log.debug("[debug] period: {}, balance: {}", [
    //   periods[i] ? periods[i]!.toString() : "null",
    //   balances[i].toString()
    // ])
  }

  log.debug(
    "[debug] transactionHash: {}, blockNumber: {}, blockTimestamp: {}, methodId: {}, methodName: {}, from: {}, recipient: {}, balance: {}, periodsLength: {}, periods: [{}], balances: [{}]",
    [
      transactionHash.toHexString(),
      blockNumber.toString(),
      timestamp.toString(),
      methodId.toHexString(),
      methodName,
      from.toHexString(),
      recipient.toHexString(),
      balance.toString(),
      periodsLength.toString(),
      periods.toString(),
      balances.toString()
    ]
  )
}

export function handleOwnerChanged(event: OwnerChangedEvent): void {
  const id = getEventId(event)

  let entity = new OwnerChangedEntity(id)
  entity.oldOwner = event.params.oldOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  log.info("[log] OwnerChanged event transaction hash: {}", [
    entity.transactionHash.toHexString()
  ])

  // Save the entity to the store
  entity.save()
}

export function handleOwnerNominated(event: OwnerNominatedEvent): void {
  const id = getEventId(event)

  let entity = new OwnerNominatedEntity(id)
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  log.info("[log] OwnerNominated event transaction hash: {}", [
    entity.transactionHash.toHexString()
  ])

  // Save the entity to the store
  entity.save()
}
