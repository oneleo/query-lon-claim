import {
  Address,
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

// export const toTuple = (calldata: TypedArray<number>): Bytes => {
//   // Prepend a "tuple" prefix (function params are arrays, not tuples)
//   // Refer: https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays
//   const tuplePrefix = ByteArray.fromHexString(
//     "0x0000000000000000000000000000000000000000000000000000000000000020"
//   )

//   const calldataAsTuple = new Uint8Array(tuplePrefix.length + calldata.length)

//   // Concat prefix & original calldata
//   calldataAsTuple.set(tuplePrefix, 0)
//   calldataAsTuple.set(calldata, tuplePrefix.length)

//   return Bytes.fromUint8Array(calldataAsTuple)
// }

export function handleClaimed(event: ClaimedEvent): void {
  const id = getEventId(event)
  //   const id = event.transaction.hash.concatI32(event.logIndex.toI32())
  const zero = BigInt.fromU32(0)
  const one = Bytes.fromI32(1)
  const tuplePrefix = ByteArray.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000020"
  )

  const blockNumber = event.block.number
  const timestamp = event.block.timestamp
  const transactionHash = event.transaction.hash
  const transactionInput = event.transaction.input
  const from = changetype<Bytes>(event.transaction.from)
  const methodId = Bytes.fromUint8Array(transactionInput.subarray(0, 4))
  const calldata = transactionInput.subarray(4)

  const recipient = changetype<Bytes>(event.params.recipient)
  const balance = event.params.balance
  const method = getMethod(methodId)
  const methodName = getMethodName(methodId)

  // Update total
  let claimedTotalEntity = ClaimedTotalEntity.load(one)
  // In the Subgraph handler, using === always returns false. Please use == for comparison.
  if (claimedTotalEntity == null) {
    claimedTotalEntity = new ClaimedTotalEntity(one)
    claimedTotalEntity.total = zero
  }
  claimedTotalEntity.total = claimedTotalEntity.total.plus(balance)

  // Update total by from
  let claimedTotalByFromEntity = ClaimedTotalByFromEntity.load(from)
  if (claimedTotalByFromEntity == null) {
    claimedTotalByFromEntity = new ClaimedTotalByFromEntity(from)
    claimedTotalByFromEntity.from = from
    claimedTotalByFromEntity.total = zero
  }
  claimedTotalByFromEntity.total = claimedTotalByFromEntity.total.plus(balance)

  // Update total by recipient
  let claimedTotalByRecipientEntity =
    ClaimedTotalByRecipientEntity.load(recipient)
  if (claimedTotalByRecipientEntity == null) {
    claimedTotalByRecipientEntity = new ClaimedTotalByRecipientEntity(recipient)
    claimedTotalByRecipientEntity.recipient = recipient
    claimedTotalByRecipientEntity.total = zero
  }
  claimedTotalByRecipientEntity.total =
    claimedTotalByRecipientEntity.total.plus(balance)

  // Create Claimed entity
  const claimedEntity = new ClaimedEntity(id)
  claimedEntity.recipient = recipient
  claimedEntity.balance = balance
  claimedEntity.blockNumber = blockNumber
  claimedEntity.blockTimestamp = timestamp
  claimedEntity.transactionHash = transactionHash
  claimedEntity.transactionMethodId = methodId
  claimedEntity.transactionMethodName = methodName

  // Prepend a "tuple" prefix (function params are arrays, not tuples)
  // Refer: https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays
  const calldataAsTuple = new Uint8Array(tuplePrefix.length + calldata.length)
  calldataAsTuple.set(tuplePrefix, 0)
  calldataAsTuple.set(calldata, tuplePrefix.length)
  const calldataAsTupleByte = Bytes.fromUint8Array(calldataAsTuple)

  const periods: Array<BigInt | null> = []
  const balances: Array<BigInt> = []

  // Currently, the switch conditions (case values) are implicitly converted to u32, i.e. switching over strings or similar is not yet supported.
  // Refer: https://www.assemblyscript.org/examples/snippets.html#switch-case
  switch (method) {
    case Method.claimPeriod: {
      const decode = ethereum.decode(
        "(address,uint256,uint256,bytes32[])",
        calldataAsTupleByte
      )
      if (decode) {
        const claimPeriod = decode.toTuple()
        periods.push(claimPeriod[1].toBigInt())
        balances.push(claimPeriod[2].toBigInt())
      }
      break
    }
    case Method.claimPeriods: {
      const decode = ethereum.decode(
        "(address,(uint256,uint256,bytes32[])[])",
        calldataAsTupleByte
      )
      if (decode) {
        const claimPeriods = decode.toTuple()
        const claims = claimPeriods[1].toTupleArray<ethereum.Tuple>()
        for (let i = 0; i < claims.length; i++) {
          periods.push(claims[i][0].toBigInt())
          balances.push(claims[i][1].toBigInt())
        }
      }
      break
    }
    case Method.execute: {
      claimedEntity.transactionMethodName = MethodName.execute
      periods.push(null)
      balances.push(balance)
      break
    }
    default: {
      claimedEntity.transactionMethodName = MethodName.unknown
      periods.push(null)
      balances.push(balance)
      break
    }
  }
  const periodsLength = periods.length
  claimedEntity.periodsLength = periodsLength

  for (let i = 0; i < periodsLength; i++) {
    const idWithIndex = id.concat(Bytes.fromUTF8("-")).concat(Bytes.fromI32(i))
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

    log.info("[test] period: {}, balance: {}", [
      periods[i] ? periods[i]!.toString() : "null",
      balances[i].toString()
    ])
  }

  //   log.info("[log] id: {}", [id.toHexString()])

  log.info(
    "[log] transactionHash: {}, methodId: {}, methodName: {}, from: {}, recipient: {}, balance: {}, periodsLength: {}, transactionInput: {}",
    [
      transactionHash.toHexString(),
      methodId.toHexString(),
      methodName,
      from.toHexString(),
      recipient.toHexString(),
      balance.toString(),
      periodsLength.toString(),
      transactionInput.toHexString()
    ]
  )

  // TODO: decode calldata
  // Refer: https://thegraph.com/docs/en/developing/graph-ts/api/#encodingdecoding-abi
  // Refer: https://github.com/graphprotocol/graph-node/blob/6a7806cc465949ebb9e5b8269eeb763857797efc/tests/integration-tests/host-exports/src/mapping.ts#L72

  // Refer: https://etherscan.io/tx/0x126017fe53cb762222313c4fe92de096544ed325d32b472f9c302cd992e628f2
  //   const claimPeriod_0x126017fe = Bytes.fromHexString(
  //     "..."
  //   )
  //   const claimPeriod_input = claimPeriod_0x126017fe.subarray(4)

  // Refer: The Graph nodes can't decode ABI encoded data containing arrays
  // https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays

  // prepend a "tuple" prefix (function params are arrays, not tuples)

  //   const functionInputAsTuple = new Uint8Array(
  //     tuplePrefix.length + claimPeriod_input.length
  //   )

  // concat prefix & original input
  //   functionInputAsTuple.set(tuplePrefix, 0)
  //   functionInputAsTuple.set(claimPeriod_input, tuplePrefix.length)

  //   const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple)

  //   log.info("test01", [])
  //   const claimPeriod_input_decode = ethereum.decode(
  //     "(address,uint256,uint256,bytes32[])",
  //     tupleInputBytes
  //   )!
  //   const claimPeriod_input_decode = ethereum.decode(
  //     "(address,(uint256,uint256,bytes32[])[])",
  //     tupleInputBytes
  //   )!

  //   log.info("test02", [])
  //   const claimPeriod_input_tuple = claimPeriod_input_decode.toTuple()

  //   log.info("test03", [])
  //   const recipientAddress = claimPeriod_input_tuple[0]
  //   const tupleArray1 = claimPeriod_input_tuple[1]

  //   log.info("claimPeriod: recipient: {}", [
  //     recipientAddress.toAddress().toHexString()
  //   ])

  //   log.info("test04", [])
  //   const test0 = tupleArray1.toTupleArray<ethereum.Tuple>()

  //   log.info("test05", [])
  //   const test1 = test0[1][0].toBigInt().toString()

  //   const claims = claimPeriod_input_tuple[1]

  //   log.info("test06", [])
  //   log.info("test1: {}", [test1])

  //   log.info("test07", [])
  //   log.info("test2: {}", [test0.length.toString()])

  //   const test0 = claims.toArray()
  //   const test1 = test0[0].toTupleArray()
  //   const test2 = test1.toBigInt().toString()
  //   const period0 = claims[0].toBigInt().toString()

  //   log.info("test07", [])
  //   log.info("claimPeriod: claims: {}", [claims])

  //   log.info("test08", [])

  //   log.info("test03", [])
  //   const proof = claimPeriod_input_tuple[3].toBytesArray()

  //   log.info("test04", [])
  //   log.info("claimPeriod: recipient: {}, period: {}, balance: {}", [
  //     claimPeriod_input_tuple[0].toAddress().toHexString(),
  //     claimPeriod_input_tuple[1].toBigInt().toString(),
  //     claimPeriod_input_tuple[2].toBigInt().toString()
  //   ])

  //   log.info("test05", [])
  //   log.info("claimPeriod: proof: {}, {}, {}, ...", [
  //     proof[0].toHexString(),
  //     proof[1].toHexString(),
  //     proof[2].toHexString()
  //   ])

  //   log.info("test06", [])
  //   log.info("claimPeriod: end of proof: {}", [
  //     proof[proof.length - 1].toHexString()
  //   ])

  claimedEntity.save()
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

  entity.save()
}
