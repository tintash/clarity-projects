import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "the data contract allows only valid callers in test function",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall("data", "test", [], deployer.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "the data contract allows only valid callers in get-user-info function",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const userId = 0;

    let block = chain.mineBlock([
      Tx.contractCall(
        "data",
        "get-user-info",
        [types.uint(userId)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "the data contract allows only valid callers in set-user-info function",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const userId = 0;
    const userInfo = { name: types.ascii("saad"), age: types.uint(25) };

    let block = chain.mineBlock([
      Tx.contractCall(
        "data",
        "set-user-info",
        [types.uint(userId), types.tuple(userInfo)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});
