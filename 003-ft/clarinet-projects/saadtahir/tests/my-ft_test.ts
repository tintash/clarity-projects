import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Validate that no other user than app can call my-ft functions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const userA = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "my-ft",
        "goal-scored",
        [types.uint(100), types.principal(deployer.address)],
        userA.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(102);
  },
});
