import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "app user get info when it is not set",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const data_trait = `${deployer.address}.data`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "app",
        "get-user-info",
        [types.principal(data_trait), types.uint(0)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectNone();
  },
});

Clarinet.test({
  name: "app user get info when it is not set",
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
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
  },
});
