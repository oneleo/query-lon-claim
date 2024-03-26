import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
  log
} from "@graphprotocol/graph-ts"
import {
  Claimed as ClaimedEvent,
  OwnerChanged as OwnerChangedEvent,
  OwnerNominated as OwnerNominatedEvent
} from "../generated/MerkleRedeem/MerkleRedeem"
import {
  Claimed,
  ClaimedTotal,
  ClaimedTotalByFrom,
  ClaimedTotalByRecipient,
  OwnerChanged,
  OwnerNominated
} from "../generated/schema"

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

export const enum MethodName {
  // function: claimPeriod(address recipient, uint256 period, uint256 balance, bytes32[] memory proof)
  claimPeriod = 0x8dbfd5e8, // = keccak256(abi.encodePacked("claimPeriod(address,uint256,uint256,bytes32[])"))
  // function: function claimPeriods(address recipient, Claim[] memory claims)
  claimPeriods = 0xb03d8c2f, // = keccak256(abi.encodePacked("claimPeriods(address,(uint256,uint256,bytes32[])[])"))
  // function: execute(address _target, bytes _data)
  execute = 0x1cff79cd, // = keccak256(abi.encodePacked("execute(address,bytes)"))
  undefined = 0x00000000
}

export const getMethodName = (m: Bytes): MethodName => {
  if (m.equals(Bytes.fromI32(MethodName.claimPeriod))) {
    return MethodName.claimPeriod
  }
  if (m.equals(Bytes.fromI32(MethodName.claimPeriods))) {
    return MethodName.claimPeriods
  }
  return MethodName.undefined
}

export function handleClaimed(event: ClaimedEvent): void {
  const id = getEventId(event)
  const zero = BigInt.fromU32(0)
  const one = Bytes.fromI32(1)

  const transactionHash = event.transaction.hash
  const from = event.transaction.from.toHexString()
  const fromBytes = Bytes.fromHexString(from)
  const input = event.transaction.input
  const methodId = Bytes.fromUint8Array(input.subarray(0, 4))
  const calldata = input.subarray(4)
  const calldataBytes = Bytes.fromUint8Array(calldata)

  const recipient = event.params.recipient.toHexString()
  const recipientBytes = Bytes.fromHexString(recipient)
  const balance = event.params.balance

  // Update total
  let claimedTotalEntity = ClaimedTotal.load(one)
  // In the Subgraph handler, using the === statement always results in false.
  // Please use the == statement for comparison.
  if (claimedTotalEntity == null) {
    claimedTotalEntity = new ClaimedTotal(one)
    claimedTotalEntity.total = zero
  }
  claimedTotalEntity.total = claimedTotalEntity.total.plus(balance)

  // Update total by from
  let claimedTotalByFromEntity = ClaimedTotalByFrom.load(fromBytes)
  if (claimedTotalByFromEntity == null) {
    claimedTotalByFromEntity = new ClaimedTotalByFrom(fromBytes)
    claimedTotalByFromEntity.from = from
    claimedTotalByFromEntity.total = zero
  }
  claimedTotalByFromEntity.total = claimedTotalByFromEntity.total.plus(balance)

  // Update total by recipient
  let claimedTotalByRecipientEntity =
    ClaimedTotalByRecipient.load(recipientBytes)
  if (claimedTotalByRecipientEntity == null) {
    claimedTotalByRecipientEntity = new ClaimedTotalByRecipient(recipientBytes)
    claimedTotalByRecipientEntity.recipient = recipient
    claimedTotalByRecipientEntity.total = zero
  }
  claimedTotalByRecipientEntity.total =
    claimedTotalByRecipientEntity.total.plus(balance)

  // Create Claimed entity
  let claimedEntity = new Claimed(id)
  claimedEntity.recipient = recipientBytes
  claimedEntity.balance = balance

  claimedEntity.blockNumber = event.block.number
  claimedEntity.blockTimestamp = event.block.timestamp
  claimedEntity.transactionHash = transactionHash

  // Get transaction input and calldata

  claimedEntity.transactionInput = input
  claimedEntity.transactionInputLength = input.byteLength

  claimedEntity.transactionMethodId = methodId
  claimedEntity.transactionMethodId02 = methodId
  claimedEntity.transactionMethodId03 = methodId
  claimedEntity.transactionMethodId04 = methodId
  claimedEntity.transactionMethodId05 = methodId
  claimedEntity.transactionMethodId06 = methodId
  claimedEntity.transactionMethodId07 = methodId
  claimedEntity.transactionMethodId08 = methodId
  claimedEntity.transactionMethodId09 = methodId
  claimedEntity.transactionMethodId10 = methodId
  claimedEntity.transactionMethodId11 = methodId
  claimedEntity.transactionMethodId12 = methodId

  // Prepend a "tuple" prefix (function params are arrays, not tuples)
  // Refer: https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays
  const tuplePrefix = ByteArray.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000020"
  )
  const calldataAsTuple = new Uint8Array(tuplePrefix.length + calldata.length)

  // Concat prefix & original calldata
  calldataAsTuple.set(tuplePrefix, 0)
  calldataAsTuple.set(calldata, tuplePrefix.length)

  const calldataAsTupleBytes = Bytes.fromUint8Array(calldataAsTuple)

  const methodName = getMethodName(methodId)
  claimedEntity.transactionMethodName = Bytes.fromI32(methodName).toHexString()

  let periods: Array<BigInt> = []
  switch (methodName) {
    case MethodName.claimPeriod: {
      const decode = ethereum.decode(
        "(address,uint256,uint256,bytes32[])",
        calldataAsTupleBytes
      )
      if (decode) {
        const decodeTuple = decode.toTuple()
        periods.push(decodeTuple[1].toBigInt())
      }
      break
    }
    case MethodName.claimPeriods: {
      const decode = ethereum.decode(
        "(address,(uint256,uint256,bytes32[])[])",
        calldataAsTupleBytes
      )
      if (decode) {
      }
      break
    }
    default:
      break
  }

  log.info(
    "[log] transactionHash: {}, methodId: {}, from: {}, recipient: {}, balance: {}, input: {}",
    [
      transactionHash.toHexString(),
      methodId.toHexString(),
      from,
      recipient,
      balance.toString(),
      input.toHexString()
    ]
  )

  // TODO: decode calldata
  // Refer: https://thegraph.com/docs/en/developing/graph-ts/api/#encodingdecoding-abi
  // Refer: https://github.com/graphprotocol/graph-node/blob/6a7806cc465949ebb9e5b8269eeb763857797efc/tests/integration-tests/host-exports/src/mapping.ts#L72

  // Refer: https://etherscan.io/tx/0x126017fe53cb762222313c4fe92de096544ed325d32b472f9c302cd992e628f2
  const claimPeriod_0x126017fe = Bytes.fromHexString(
    "0x8dbfd5e800000000000000000000000090e5e30d3a891693d6822e06b52562dd4dbacc83000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001ef0e153fde00e100000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000013410749d4d1c1126ad8dc459d1ccf1ee40017036511f81fddb0f3e02c35d7cd60d3b4489831eb87c1a1644cf1bdbff685dce85a50df7cd3daa0cdbde9b1e164a29f4af8f41a19580999867d417f42506d3dec72577b8d0202704b8522ac1b93f50ad867d40e5acd890c136b03334a7bacd79e84a69dbf0f8ccf2011045a8c50b84faf10c2555d5b3f04f22d9c06c1ed10f9bd7ca5795a95463d473a8d4e8bcd6746e85f7e5e688ffd50f6106db8f0891831f7b2b952a8d79f8d172106ead63fb07d60e16595d5d1eea5a8c41940f6658fffea1ad46aef3a7c24b4666d9f0938520677784c34e60221e86c4ddafaf316fb8fe8b90412f1165e6e1c6e7c3cdbc2b94554589fc8b4e5c74daf51648d032b1855fdd88fc7b5e329ac11a4835600fb7da497bc3cfb7e6606f464b93b01a54748c07d62d81436210fdc723f1f7278fc191b62e41d26203ae1a413086d4b92cd5f7941e87e811a6a31e7e76bd341c7a8ee36831029ce5be0064b6488e337ff2f30cf9774ceebe904cb8b9a9aa4f0a492bb5f0ff28ad11af57e6e9dd76529fa6da1b8a33c1f3d4461117ba33c9e358b2fb8d86be693dbfd5e331c594317d60e63990d041e0323df453513421a3852f406b92bb78501010a85da7ad080af9da3614ae445e99717a526d9b975ed35a3d3d63f48fc0eb72563838064bcf2f5b5bf5214d5ee99995d2e8540803e9ca9587531652a547acaeac531fc4f2f44caaab68da04734a0c0daaeca1c646063ec6d2b056237922012f937af7e2abdde29328b3b26207e83557b5ec493ff86acb06da8d1f82e43f3260bf0c3bd1be8573379e88b5692eca73ffab33d94ed843ad437fd4835"
  )
  const claimPeriod_input = claimPeriod_0x126017fe.subarray(4)

  // Refer: The Graph nodes can't decode ABI encoded data containing arrays
  // https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays

  // prepend a "tuple" prefix (function params are arrays, not tuples)

  const functionInputAsTuple = new Uint8Array(
    tuplePrefix.length + claimPeriod_input.length
  )

  // concat prefix & original input
  functionInputAsTuple.set(tuplePrefix, 0)
  functionInputAsTuple.set(claimPeriod_input, tuplePrefix.length)

  const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple)

  log.info("test01", [])
  const claimPeriod_input_decode = ethereum.decode(
    "(address,uint256,uint256,bytes32[])",
    tupleInputBytes
  )!

  log.info("test02", [])
  const claimPeriod_input_tuple = claimPeriod_input_decode.toTuple()
  log.info("test03", [])
  const proof = claimPeriod_input_tuple[3].toBytesArray()

  log.info("test04", [])
  log.info("claimPeriod: recipient: {}, period: {}, balance: {}", [
    claimPeriod_input_tuple[0].toAddress().toHexString(),
    claimPeriod_input_tuple[1].toBigInt().toString(),
    claimPeriod_input_tuple[2].toBigInt().toString()
  ])

  log.info("test05", [])
  log.info("claimPeriod: proof: {}, {}, {}, ...", [
    proof[0].toHexString(),
    proof[1].toHexString(),
    proof[2].toHexString()
  ])

  log.info("test06", [])
  log.info("claimPeriod: end of proof: {}", [
    proof[proof.length - 1].toHexString()
  ])

  log.info("test07", [])
  // Refer: https://etherscan.io/tx/0x8b510abb60acf348aff1b612764160c24b74274a1bb651d615eb914fd63fddf3
  const claimPeriods_0x8b510abb = Bytes.fromHexString(
    "0xb03d8c2f00000000000000000000000032bf0ea129625be1ef65072eb0115cb91f4182ba0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001158e460913d00000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000136684a2eb61af4e61ad03f15cd4ac2e35706d247c74ee450ed6e75cd0a47a87a50571901faac1e922da35c04fa2d838b74007b4d9c6dad24f61b189bda9a1631c29877c3e152fd5ce85f4b1b50123b2b5e765a0a61422ea0d1303948a7a772e7f001ad033d360781f1455c5dba184e5b71b22f032dd8c37cfb71e8e0eb8db7306af5bb939c9876821f30f94a22a599570020ea70a05a0f8353cd3688cbaec631102041541c001312b33000aa0780ed1e817db55a39ad56d5aed617e4f6b3866458cc109722dd520077b5cabda9b9f870d0f36d6365dafa01e0cdfee348ffd0e69b8ec32bb1bb6141e5dfcab12c480959de5f4913069101734d8a2bdad38ce5872ef87e9709b4826ed710956c86a89fb15c560a27e7c6b631321c54511261c3bac04759b546e924d5afdadce3b0f6c8bcd661c72d092ce4b0887a43133f15bf366f005f7545d6950c056504433e059e5debba056527ed6059f6036f7a375015efe4d7f679a65de9b17f4520008e0a7412e0a4a5b2af96fb18ff4aa60ab4f774bd28111c47cc4720db21c9c5ca99c9fdc37826e535f7ad9d0a5d7e6026d2a31a0d6a6538751d2eba3ace306122ab34d06bc49e5331518b17e0a92a8b9b43e4979f966b47695c09e2a8296a28abb2421bb6682cb7803488e2a3da761898fbaef1916c6479d589e82f8f29a935868125e2231318272dfadc67d9ca13bf331b0dd2be633d08bc3574ca73a990ecacc502bf177000b6c3f42e6f4fd2b15a123ac5ce288d99933749cb5ce5dc1750bb865192fba88c0b61701d0f18ea6039265c1da43672e43f3260bf0c3bd1be8573379e88b5692eca73ffab33d94ed843ad437fd4835"
  )

  claimedEntity.save()
}

export function handleOwnerChanged(event: OwnerChangedEvent): void {
  const id = getEventId(event)

  let entity = new OwnerChanged(id)
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

  let entity = new OwnerNominated(id)
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  log.info("[log] OwnerNominated event transaction hash: {}", [
    entity.transactionHash.toHexString()
  ])

  entity.save()
}
