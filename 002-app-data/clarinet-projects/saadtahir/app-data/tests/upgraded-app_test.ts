import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "getting user info when it is not set",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    //(contract-call? .upgraded-app upgraded-user-info .data u0)
    const deployer = accounts.get("deployer")!;
    const data_trait = `${deployer.address}.data`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "upgraded-app",
        "upgraded-user-info",
        [types.principal(data_trait), types.uint(0)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "checking user info is none when age is less than 18",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const data_trait = `${deployer.address}.data`;
    const userId = 0;
    const userInfo = { name: types.ascii("saad"), age: types.uint(10) };

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "set-user-info",
        [
          types.principal(data_trait),
          types.uint(userId),
          types.tuple(userInfo),
        ],
        deployer.address
      ),
      Tx.contractCall(
        "upgraded-app",
        "upgraded-user-info",
        [types.principal(data_trait), types.uint(0)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectNone();
  },
});

Clarinet.test({
  name: "checking user info is none when age is greater than 18",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const data_trait = `${deployer.address}.data`;
    const userId = 0;
    const userInfo = { name: types.ascii("saad"), age: types.uint(20) };

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "set-user-info",
        [
          types.principal(data_trait),
          types.uint(userId),
          types.tuple(userInfo),
        ],
        deployer.address
      ),
      Tx.contractCall(
        "upgraded-app",
        "upgraded-user-info",
        [types.principal(data_trait), types.uint(0)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectSome(); // some tuple
  },
});

Clarinet.test({
  name: "checking user info is none when age is equal to 18",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const data_trait = `${deployer.address}.data`;
    const userId = 0;
    const userInfo = { name: types.ascii("saad"), age: types.uint(18) };

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "set-user-info",
        [
          types.principal(data_trait),
          types.uint(userId),
          types.tuple(userInfo),
        ],
        deployer.address
      ),
      Tx.contractCall(
        "upgraded-app",
        "upgraded-user-info",
        [types.principal(data_trait), types.uint(0)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectSome(); // some tuple
  },
});
