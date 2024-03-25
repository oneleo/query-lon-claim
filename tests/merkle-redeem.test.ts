import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  describe,
  test
} from "matchstick-as/assembly/index"
import { Claimed as ClaimedEvent } from "../generated/MerkleRedeem/MerkleRedeem"
import { Claimed } from "../generated/schema"
import { handleClaimed } from "../src/merkle-redeem"
import { createClaimedEvent } from "./merkle-redeem-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let recipient = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let balance = BigInt.fromI32(234)
    let newClaimedEvent = createClaimedEvent(recipient, balance)
    handleClaimed(newClaimedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Claimed created and stored", () => {
    assert.entityCount("Claimed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Claimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "recipient",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Claimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "balance",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })

  // TODO: Add more tests here
  // Refer: https://github.com/olivermehr/subgraph-test/blob/main/tests/indexToken.test.ts
  // Refer: https://github.com/graphprotocol/graph-node/blob/6a7806cc465949ebb9e5b8269eeb763857797efc/tests/integration-tests/host-exports/src/mapping.ts#L72
})
