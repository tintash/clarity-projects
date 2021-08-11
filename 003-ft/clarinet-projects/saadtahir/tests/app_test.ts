import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Validate that goal-scored can only be called by contract-owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recepient = accounts.get("wallet_1")!;
    const asset_identifier = `${deployer.address}.my-ft::my-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "goal-scored",
        [types.principal(recepient.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      1000000000,
      recepient.address,
      asset_identifier
    );
  },
});

Clarinet.test({
  name: "Validate that goal-scored cannot be called by someone else",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recepient = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "goal-scored",
        [types.principal(recepient.address)],
        recepient.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(10);
  },
});

Clarinet.test({
  name: "Validate that transfer can only be called by contract-owner or token owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const sender = accounts.get("wallet_1")!;
    const recepient = accounts.get("wallet_2")!;
    const myFtTrait = `${deployer.address}.my-ft`;
    const assetIdentifier = `${deployer.address}.my-ft::my-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "goal-scored",
        [types.principal(sender.address)],
        deployer.address
      ),
      Tx.contractCall(
        "app",
        "transfer",
        [
          types.principal(myFtTrait),
          types.uint(1000),
          types.principal(sender.address),
          types.principal(recepient.address),
          types.none(),
        ],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      1000000000,
      sender.address,
      assetIdentifier
    );

    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[1].events.expectFungibleTokenTransferEvent(
      1000,
      sender.address,
      recepient.address,
      assetIdentifier
    );
  },
});

Clarinet.test({
  name: "Validate that destroy can only be called by contract-owner or token owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const sender = accounts.get("wallet_1")!;
    const assetIdentifier = `${deployer.address}.my-ft::my-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "goal-scored",
        [types.principal(sender.address)],
        deployer.address
      ),
      Tx.contractCall(
        "app",
        "destroy",
        [types.uint(1000), types.principal(sender.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      1000000000,
      sender.address,
      assetIdentifier
    );

    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[1].events.expectFungibleTokenBurnEvent(
      1000,
      sender.address,
      assetIdentifier
    );
  },
});

Clarinet.test({
  name: "Validate that destroy cannot be called other person",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const sender = accounts.get("wallet_1")!;
    const other = accounts.get("wallet_2")!;
    const assetIdentifier = `${deployer.address}.my-ft::my-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "goal-scored",
        [types.principal(sender.address)],
        deployer.address
      ),
      Tx.contractCall(
        "app",
        "destroy",
        [types.uint(1000), types.principal(sender.address)],
        other.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      1000000000,
      sender.address,
      assetIdentifier
    );

    block.receipts[1].result.expectErr().expectUint(102);
  },
});
