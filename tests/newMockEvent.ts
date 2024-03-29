import {
  Address,
  BigInt,
  Bytes,
  ethereum,
  Wrapped
} from "@graphprotocol/graph-ts"
import { TransactionInputSample } from "./transactionInputSample"

// Refer: node_modules/matchstick-as/assembly/defaults.ts
const defaultAddress = Address.fromString(
  "0xA16081F360e3847006dB660bae1c6d1b2e17eC2A"
)
const defaultAddressBytes = defaultAddress as Bytes
const defaultBigInt = BigInt.fromI32(1)
const defaultIntBytes = Bytes.fromI32(1)
const defaultEventDataLogType = "default_log_type"

export function newMockEvent(
  transaction: ethereum.Transaction
): ethereum.Event {
  return new ethereum.Event(
    defaultAddress,
    defaultBigInt,
    defaultBigInt,
    defaultEventDataLogType,
    newBlock(),
    transaction,
    [],
    newTransactionReceipt()
  )
}

function newBlock(): ethereum.Block {
  return new ethereum.Block(
    defaultAddressBytes,
    defaultAddressBytes,
    defaultAddressBytes,
    defaultAddress,
    defaultAddressBytes,
    defaultAddressBytes,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt
  )
}

export function newTransaction(): ethereum.Transaction {
  return new ethereum.Transaction(
    defaultAddressBytes,
    defaultBigInt,
    defaultAddress,
    defaultAddress,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultAddressBytes,
    defaultBigInt
  )
}

function newTransactionReceipt(): ethereum.TransactionReceipt {
  return new ethereum.TransactionReceipt(
    defaultAddressBytes,
    defaultBigInt,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultAddress,
    [newLog()],
    defaultBigInt,
    defaultAddressBytes,
    defaultAddressBytes
  )
}

function newLog(): ethereum.Log {
  return new ethereum.Log(
    defaultAddress,
    [defaultAddressBytes],
    defaultAddressBytes,
    defaultAddressBytes,
    defaultIntBytes,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultEventDataLogType,
    new Wrapped(false)
  )
}

// Custom transactions
export namespace CustomTransactions {
  export const newClaimPeriodTransaction = (): ethereum.Transaction => {
    // Refer: https://etherscan.io/tx/0x126017fe53cb762222313c4fe92de096544ed325d32b472f9c302cd992e628f2
    return new ethereum.Transaction(
      defaultAddressBytes,
      defaultBigInt,
      defaultAddress,
      defaultAddress,
      defaultBigInt,
      defaultBigInt,
      defaultBigInt,
      Bytes.fromHexString(TransactionInputSample.claimPeriodInput),
      defaultBigInt
    )
  }

  // Refer: https://etherscan.io/tx/0x8b510abb60acf348aff1b612764160c24b74274a1bb651d615eb914fd63fddf3
  export const newClaimPeriodsSingleTransaction = (): ethereum.Transaction => {
    return new ethereum.Transaction(
      defaultAddressBytes,
      defaultBigInt,
      defaultAddress,
      defaultAddress,
      defaultBigInt,
      defaultBigInt,
      defaultBigInt,
      Bytes.fromHexString(TransactionInputSample.claimPeriodsSingleInput),
      defaultBigInt
    )
  }

  // Refer: https://etherscan.io/tx/0xa4262ddcb02b29be1da9db6c4e5ad33d3a881f9bce077eaebea6f85b617f12b4
  export const newClaimPeriodsMultipleTransaction =
    (): ethereum.Transaction => {
      return new ethereum.Transaction(
        defaultAddressBytes,
        defaultBigInt,
        defaultAddress,
        defaultAddress,
        defaultBigInt,
        defaultBigInt,
        defaultBigInt,
        Bytes.fromHexString(TransactionInputSample.claimPeriodsMultipleInput),
        defaultBigInt
      )
    }

  // Refer: https://etherscan.io/tx/0xe78ecb606b56b4393acf9b46f0ceb53edfc4fabf23ee6c4d6c8d9d90aa41dc53
  export const newExecuteTransaction = (): ethereum.Transaction => {
    return new ethereum.Transaction(
      defaultAddressBytes,
      defaultBigInt,
      defaultAddress,
      defaultAddress,
      defaultBigInt,
      defaultBigInt,
      defaultBigInt,
      Bytes.fromHexString(TransactionInputSample.executeInput),
      defaultBigInt
    )
  }

  // Refer: https://etherscan.io/tx/0xc304f3eeb8a9f438697d83c5fa9c7028462ba7eb343b8589140829d65639c627
  export const newUnknownInputTransaction_0xa2d41b9e =
    (): ethereum.Transaction => {
      return new ethereum.Transaction(
        defaultAddressBytes,
        defaultBigInt,
        defaultAddress,
        defaultAddress,
        defaultBigInt,
        defaultBigInt,
        defaultBigInt,
        Bytes.fromHexString(TransactionInputSample.unknownInput_0xa2d41b9e),
        defaultBigInt
      )
    }

  // Refer: https://etherscan.io/tx/0x8e434a79bdf9fdee70dfc77ef6e1e23b9d3ef076593999fba2cdd15f909748d8
  export const newUnknownInputTransaction_0x477564b4 =
    (): ethereum.Transaction => {
      return new ethereum.Transaction(
        defaultAddressBytes,
        defaultBigInt,
        defaultAddress,
        defaultAddress,
        defaultBigInt,
        defaultBigInt,
        defaultBigInt,
        Bytes.fromHexString(TransactionInputSample.unknownInput_0x477564b4),
        defaultBigInt
      )
    }

  // Refer: https://etherscan.io/tx/0x56e9da9f1fecb79d5e1d6c6fd601b89ee91544652d768e2050f4871b86360e15
  export const newUnknownInputTransaction_0x8607c220 =
    (): ethereum.Transaction => {
      return new ethereum.Transaction(
        defaultAddressBytes,
        defaultBigInt,
        defaultAddress,
        defaultAddress,
        defaultBigInt,
        defaultBigInt,
        defaultBigInt,
        Bytes.fromHexString(TransactionInputSample.unknownInput_0x8607c220),
        defaultBigInt
      )
    }
}