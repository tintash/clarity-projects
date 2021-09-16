import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Ensure that velocity price is more than the min price limit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var owner = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-market",
        "put-velocity-for-sale",
        [types.uint(1), types.uint(2500), types.principal(owner.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(201);
  },
});

Clarinet.test({
  name: "Ensure that only token owner can put velocity for sale",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var owner = accounts.get("wallet_1")!;
    var notOwner = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall("velocity", "claim", [], owner.address),
      Tx.contractCall(
        "velocity-market",
        "put-velocity-for-sale",
        [types.uint(1), types.uint(25000), types.principal(owner.address)],
        notOwner.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[1].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "Ensure that putting velocity for sale updates the correct variables",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var owner = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("velocity", "claim", [], owner.address),
      Tx.contractCall(
        "velocity-market",
        "put-velocity-for-sale",
        [types.uint(1), types.uint(25000), types.principal(owner.address)],
        owner.address
      ),
      Tx.contractCall(
        "velocity-market",
        "get-velocity-for-sale",
        [types.uint(1)],
        owner.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[1].result.expectOk().expectBool(true);
    assertEquals(
      block.receipts[2].result,
      types.some(`{price: ${types.uint(25000)}, seller: ${owner.address}}`)
    );
  },
});

Clarinet.test({
  name: "Ensure that buyer is the tx-sender",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var buyer = accounts.get("wallet_1")!;
    var notBuyer = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-market",
        "buy-velocity",
        [types.uint(1), types.principal(buyer.address)],
        notBuyer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(203);
  },
});

Clarinet.test({
  name: "Ensure that buyer can buy velocity that is available for sale",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var owner = accounts.get("wallet_1")!;
    var buyer = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall("velocity", "claim", [], owner.address),
      Tx.contractCall(
        "velocity-market",
        "put-velocity-for-sale",
        [types.uint(1), types.uint(25000), types.principal(owner.address)],
        owner.address
      ),
      Tx.contractCall(
        "velocity-market",
        "buy-velocity",
        [types.uint(2), types.principal(buyer.address)],
        buyer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that buyer can buy velocity and updates correct variables",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var owner = accounts.get("wallet_1")!;
    var buyer = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall("velocity", "claim", [], owner.address),
      Tx.contractCall(
        "velocity-market",
        "put-velocity-for-sale",
        [types.uint(1), types.uint(25000), types.principal(owner.address)],
        owner.address
      ),
      Tx.contractCall(
        "velocity-market",
        "buy-velocity",
        [types.uint(1), types.principal(buyer.address)],
        buyer.address
      ),
      Tx.contractCall(
        "velocity-market",
        "get-velocity-for-sale",
        [types.uint(1)],
        owner.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[3].result.expectNone();
  },
});
