import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Validate that add-manager can only be called by contract-owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const recipient = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "my-ft",
        "add-manager",
        [types.principal(recipient.address)],
        recipient.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "Validate that give can only be called by manager",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;
    const notManager = accounts.get("wallet_2")!;

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
        [types.uint(1000000), types.principal(recipient.address)],
        notManager.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "Validate that give mints token to recipient",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;

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
        [types.uint(1000000), types.principal(recipient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Validate that destroy can only be called by manager",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;
    const notManager = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "my-ft",
        "add-manager",
        [types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "destroy",
        [types.uint(1000), types.principal(recipient.address)],
        notManager.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "Validate that destroy burns tokens of recipient",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;

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
        [types.uint(1000000), types.principal(recipient.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "destroy",
        [types.uint(1000), types.principal(recipient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Validate that transfer can only be called by token owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const sender = accounts.get("wallet_1")!;
    const recipient = accounts.get("wallet_2")!;

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
        [types.uint(1000000), types.principal(sender.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "transfer",
        [
          types.uint(1000),
          types.principal(sender.address),
          types.principal(recipient.address),
          types.none(),
        ],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr().expectUint(102);
  },
});

Clarinet.test({
  name: "Validate that transfer is done between sender and receiver",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const sender = accounts.get("wallet_1")!;
    const recipient = accounts.get("wallet_2")!;

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
        [types.uint(1000000), types.principal(sender.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "transfer",
        [
          types.uint(1000),
          types.principal(sender.address),
          types.principal(recipient.address),
          types.none(),
        ],
        sender.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Validate that convert-tokens can only be called by contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;
    const userB = accounts.get("wallet_2")!;

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
        [types.uint(1000000), types.principal(recipient.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "convert-tokens",
        [types.uint(100000), types.principal(recipient.address)],
        userB.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "Validate that convert-tokens converts recipient tokens to stx",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;

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
        [types.uint(1000000), types.principal(recipient.address)],
        deployer.address
      ),
      Tx.contractCall(
        "my-ft",
        "convert-tokens",
        [types.uint(100000), types.principal(recipient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
  },
});
