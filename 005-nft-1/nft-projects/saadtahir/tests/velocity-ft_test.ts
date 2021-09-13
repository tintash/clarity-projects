import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Ensure that only contract owner can set game manager",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that only game manager can give tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const recipient = accounts.get("wallet_1")!;
    const assetId = `${deployer.address}.velocity-ft::velocity-bucks`;
    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
      Tx.contractCall(
        "velocity-ft",
        "give",
        [types.uint(100), types.principal(recipient.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].events.expectFungibleTokenMintEvent(
      100,
      recipient.address,
      assetId
    );
    block.receipts[1].result.expectOk().expectBool(true);
  },
});
