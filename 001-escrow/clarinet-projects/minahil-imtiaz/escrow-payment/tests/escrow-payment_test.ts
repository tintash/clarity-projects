import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Ensure that seller cannot set price as u0",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const seller = accounts.get("wallet_1")!;
    const buyer = accounts.get("wallet_2")!;
    const amount = 0;
    const block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-seller",
        [
          types.principal(buyer.address),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        seller.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(3);
  },
});

Clarinet.test({
  name: "Ensure that seller can enter order record",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const seller = accounts.get("wallet_1")!;
    const buyer = accounts.get("wallet_2")!;
    const amount = 10;
    const block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-seller",
        [
          types.principal(buyer.address),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        seller.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
  },
});

Clarinet.test({
  name: "Ensure that a duplicate order cannot be inserted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const seller = accounts.get("wallet_1")!;
    const buyer = accounts.get("wallet_2")!;
    const amount = 10;
    const block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-seller",
        [
          types.principal(buyer.address),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        seller.address
      ),
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-seller",
        [
          types.principal(buyer.address),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        seller.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
    block.receipts[1].result.expectErr().expectUint(3);
  },
});

Clarinet.test({
  name: "Ensure that a buyer cannot pay for a product until the seller has inserted a record for it.",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const seller = accounts.get("wallet_1")!;
    const buyer = accounts.get("wallet_2")!;
    const amount = 10;
    const block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-buyer",
        [types.principal(seller.address), types.ascii("Candy")],
        buyer.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(4);
  },
});

Clarinet.test({
  name: "Ensure that a buyer can pay for a product after the seller has inserted a record for it.",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const seller = accounts.get("wallet_1")!;
    const buyer = accounts.get("wallet_2")!;
    const amount = 10;
    const block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-seller",
        [
          types.principal(buyer.address),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        seller.address
      ),
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-buyer",
        [types.principal(seller.address), types.ascii("Candy")],
        buyer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
    block.receipts[1].result.expectOk().expectUint(0);
  },
});

Clarinet.test({
  name: "Ensure that correct amount is transferred when item is received",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const seller = accounts.get("wallet_1")!;
    const buyer = accounts.get("wallet_2")!;
    const buyer_balance = buyer.balance;
    const seller_balance = buyer.balance;
    const amount = 10;
    const block1 = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-seller",
        [
          types.principal(buyer.address),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        seller.address
      ),
    ]);
    const block2 = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "pay-as-buyer",
        [types.principal(seller.address), types.ascii("Candy")],
        buyer.address
      ),
    ]);
    const block3 = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.escrow-payment`,
        "item-received",
        [types.principal(seller.address), types.ascii("Candy")],
        buyer.address
      ),
    ]);

    block1.receipts[0].result.expectOk().expectUint(0);
    block1.receipts[0].events.expectSTXTransferEvent(
      amount * 2,
      seller.address,
      `${deployer.address}.escrow-payment`
    );
    block2.receipts[0].result.expectOk().expectUint(0);
    block2.receipts[0].events.expectSTXTransferEvent(
      amount * 2,
      buyer.address,
      `${deployer.address}.escrow-payment`
    );
    block3.receipts[0].result.expectOk().expectUint(0);
    console.log("block 3", block3);
    block3.receipts[0].events.expectSTXTransferEvent(
      amount,
      `${deployer.address}.escrow-payment`,
      buyer.address
    );
    block3.receipts[0].events.expectSTXTransferEvent(
      amount * 3,
      `${deployer.address}.escrow-payment`,
      seller.address
    );
  },
});
