import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "upgrading from the first app contract to the second",
  async fn(chain: Chain, accounts: Map<string, Account>) {
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

    block.receipts[0].result.expectOk().expectNone();
  },
});
