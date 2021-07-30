import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Buyer has insufficient amount to buy item",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const buyer = accounts.get("wallet_1")!;
    const amount = 10000000;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-contract",
        "purchaseItem",
        [types.uint(amount)],
        buyer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(1);
  },
});

Clarinet.test({
  name: "Buyer sends item stx to the contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const buyer = accounts.get("wallet_1")!;
    const amount = 20;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-contract",
        "purchaseItem",
        [types.uint(amount)],
        buyer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // There should be a STX transfer of the amount specified from buyer to deployer.escrow-contract
    block.receipts[0].events.expectSTXTransferEvent(
      amount,
      buyer.address,
      `${deployer.address}.escrow-contract`
    );
  },
});

Clarinet.test({
  name: "Seller is not contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const accountA = accounts.get("wallet_2")!;
    const amount = 20;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-contract",
        "transferAmount",
        [types.uint(amount)],
        accountA.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "Seller sends item stx to the contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const amount = 20;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-contract",
        "transferAmount",
        [types.uint(amount)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // There should be a STX transfer of the amount specified from buyer to deployer.escrow-contract
    block.receipts[0].events.expectSTXTransferEvent(
      amount,
      deployer.address,
      `${deployer.address}.escrow-contract`
    );
  },
});

Clarinet.test({
  name: "Different buyer trys to buy item",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const buyer = accounts.get("wallet_1")!;
    const accountA = accounts.get("wallet_2")!;
    const amount = 20;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-contract",
        "purchaseItem",
        [types.uint(amount)],
        buyer.address
      ),
      Tx.contractCall(
        "escrow-contract",
        "transferAmount",
        [types.uint(amount)],
        deployer.address
      ),
      Tx.contractCall("escrow-contract", "itemPurchased", [], accountA.address),
    ]);

    block.receipts[2].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "Buyer buys item from seller and sends itemReceived event",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const buyer = accounts.get("wallet_1")!;
    const amount = 20;
    const buyerRecieves = 10;
    const sellerRecieves = 30;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-contract",
        "purchaseItem",
        [types.uint(amount)],
        buyer.address
      ),
      Tx.contractCall(
        "escrow-contract",
        "transferAmount",
        [types.uint(amount)],
        deployer.address
      ),
      Tx.contractCall("escrow-contract", "itemPurchased", [], buyer.address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[2].events.expectSTXTransferEvent(
      buyerRecieves,
      `${deployer.address}.escrow-contract`,
      buyer.address
    );
    block.receipts[2].events.expectSTXTransferEvent(
      sellerRecieves,
      `${deployer.address}.escrow-contract`,
      deployer.address
    );
  },
});
