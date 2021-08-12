import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Validate that tokens are given if goal is scored",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;

    chain.mineEmptyBlockUntil(1);

    let block = chain.mineBlock([
      Tx.contractCall(
        "my-ft",
        "add-manager",
        [types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "app",
        "is-goal-scored",
        [types.uint(220), types.principal(recipient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Validate that tokens are not burnt if goal is not scored and player doesn't have enough balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;

    chain.mineEmptyBlockUntil(1);

    let block = chain.mineBlock([
      Tx.contractCall(
        "my-ft",
        "add-manager",
        [types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "app",
        "is-goal-scored",
        [types.uint(20), types.principal(recipient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "Validate that tokens are not burnt if goal is not scored and player does have enough balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;

    chain.mineEmptyBlockUntil(1);

    let block = chain.mineBlock([
      Tx.contractCall(
        "my-ft",
        "add-manager",
        [types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "give",
        [types.uint(1000000), types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "app",
        "is-goal-scored",
        [types.uint(20), types.principal(recipient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(false);
  },
});
