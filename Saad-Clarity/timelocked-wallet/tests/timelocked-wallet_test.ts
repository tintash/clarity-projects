import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Allows the contract owner to lock an amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const amount = 100;

    let block = chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(10),
          types.uint(amount),
        ],
        deployer.address
      ),
    ]);

    // The lock should be successful
    block.receipts[0].result.expectOk().expectBool(true);
    // There should be a STX transfer of the amount specified
    block.receipts[0].events.expectSTXTransferEvent(
      amount,
      deployer.address,
      `${deployer.address}.timelocked-wallet`
    );
  },
});

Clarinet.test({
  name: "Does not allow anyone else to lock an amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const accountA = accounts.get("wallet_1")!;
    const beneficiary = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [types.principal(beneficiary.address), types.uint(10), types.uint(100)],
        accountA.address
      ),
    ]);

    // Should return err-owner-only (err u100).
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "Cannot lock more than once",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const amount = 100;

    let block = chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(10),
          types.uint(amount),
        ],
        deployer.address
      ),
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(10),
          types.uint(amount),
        ],
        deployer.address
      ),
    ]);

    // First time check should be true
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectSTXTransferEvent(
      amount,
      deployer.address,
      `${deployer.address}.timelocked-wallet`
    );

    // Second time call returns error
    block.receipts[1].result.expectErr().expectUint(101);

    // No transfer event
    assertEquals(block.receipts[1].events.length, 0);
  },
});

Clarinet.test({
  name: "Unlock height cannot be in the past",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const targetBlockHeight = 10;
    const amount = 100;

    // Advance the chain until the unlock height plus one.
    chain.mineEmptyBlockUntil(targetBlockHeight + 1);

    let block = chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(targetBlockHeight),
          types.uint(amount),
        ],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(102);

    // No transfer event
    assertEquals(block.receipts[0].events.length, 0);
  },
});

Clarinet.test({
  name: "Allows the beneficiary to bestow the right to someone else",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const newBeneficiary = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [types.principal(beneficiary.address), types.uint(10), types.uint(100)],
        deployer.address
      ),
      Tx.contractCall(
        "timelocked-wallet",
        "bestow",
        [types.principal(newBeneficiary.address)],
        beneficiary.address
      ),
    ]);

    // both results are true
    block.receipts.map(({ result }) => result.expectOk().expectBool(true));
  },
});

Clarinet.test({
  name: "Does not allow anyone else to bestow the right to claim to someone else (not even the contract owner)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const accountA = accounts.get("wallet_3")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [types.principal(beneficiary.address), types.uint(10), types.uint(100)],
        deployer.address
      ),
      Tx.contractCall(
        "timelocked-wallet",
        "bestow",
        [types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "timelocked-wallet",
        "bestow",
        [types.principal(accountA.address)],
        accountA.address
      ),
    ]);

    // Better code write below with slice and maps
    // block.receipts[0].results.expectOk().expectBool(true);
    // block.receipts[1].results.expectErr().expectUint(104);
    // block.receipts[2].results.expectErr().expectUint(104);

    // All calls results in err code 104 istead of the first one
    block.receipts
      .slice(1)
      .map(({ result }) => result.expectErr().expectUint(104));
  },
});

Clarinet.test({
  name: "Allows the beneficiary to claim the balance when the block-height is reached",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const targetBlockHeight = 10;
    const amount = 10;
    chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(targetBlockHeight),
          types.uint(amount),
        ],
        deployer.address
      ),
    ]);

    // Advance the chain until the unlock height.
    chain.mineEmptyBlockUntil(targetBlockHeight);

    const block = chain.mineBlock([
      Tx.contractCall("timelocked-wallet", "claim", [], beneficiary.address),
    ]);

    // The claim was successful and the STX were transferred.
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectSTXTransferEvent(
      amount,
      `${deployer.address}.timelocked-wallet`,
      beneficiary.address
    );
  },
});

Clarinet.test({
  name: "Does not allow the beneficiary to claim the balance before the block-height is reached",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const targetBlockHeight = 10;
    const amount = 10;
    chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(targetBlockHeight),
          types.uint(amount),
        ],
        deployer.address
      ),
    ]);

    // Advance the chain until the unlock height minus one.
    chain.mineEmptyBlockUntil(targetBlockHeight - 1);

    const block = chain.mineBlock([
      Tx.contractCall("timelocked-wallet", "claim", [], beneficiary.address),
    ]);

    // Should return err-unlock-height-not-reached (err u105).
    block.receipts[0].result.expectErr().expectUint(105);
    assertEquals(block.receipts[0].events.length, 0);
  },
});

Clarinet.test({
  name: "Does not allow anyone else to claim the balance when the block-height is reached",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const beneficiary = accounts.get("wallet_1")!;
    const other = accounts.get("wallet_2")!;
    const targetBlockHeight = 10;
    const amount = 10;
    chain.mineBlock([
      Tx.contractCall(
        "timelocked-wallet",
        "lock",
        [
          types.principal(beneficiary.address),
          types.uint(targetBlockHeight),
          types.uint(amount),
        ],
        deployer.address
      ),
    ]);

    // Advance the chain until the unlock height.
    chain.mineEmptyBlockUntil(targetBlockHeight);

    const block = chain.mineBlock([
      Tx.contractCall("timelocked-wallet", "claim", [], other.address),
    ]);

    // Should return err-beneficiary-only (err u104).
    block.receipts[0].result.expectErr().expectUint(104);
    assertEquals(block.receipts[0].events.length, 0);
  },
});
