import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "the data contract allows only valid callers",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall("data", "test", [], deployer.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});
