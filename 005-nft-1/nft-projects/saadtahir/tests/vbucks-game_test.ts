import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Ensure that achievement completed event cannot be called by others",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
      Tx.contractCall(
        "vbucks-game",
        "achievement-completed",
        [types.uint(0), types.principal(player.address)],
        player.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(105);
  },
});

Clarinet.test({
  name: "Ensure that searching unavailable achievement fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
      Tx.contractCall(
        "vbucks-game",
        "achievement-completed",
        [types.uint(1), types.principal(player.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "Ensure that achievement completed event gives tokens to player",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    const assetId = `${deployer.address}.velocity-ft::velocity-bucks`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
      Tx.contractCall(
        "vbucks-game",
        "achievement-completed",
        [types.uint(0), types.principal(player.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].events.expectFungibleTokenMintEvent(
      1000,
      player.address,
      assetId
    );
    block.receipts[1].result.expectOk().expectAscii("ACHIEVEMENT_COMPLETED");
  },
});

Clarinet.test({
  name: "Ensure that unavailable cosmetic does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
      Tx.contractCall(
        "vbucks-game",
        "buy-cosmetics",
        [types.uint(1)],
        player.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "Ensure that player can buy cosmetics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    const contract = `${deployer.address}.vbucks-game`;
    const assetId = `${deployer.address}.velocity-ft::velocity-bucks`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "velocity-ft",
        "set-game-manager",
        [types.some(types.principal(deployer.address))],
        deployer.address
      ),
      Tx.contractCall(
        "vbucks-game",
        "achievement-completed",
        [types.uint(0), types.principal(player.address)],
        deployer.address
      ),
      Tx.contractCall(
        "vbucks-game",
        "buy-cosmetics",
        [types.uint(0)],
        player.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectAscii("ACHIEVEMENT_COMPLETED");
    block.receipts[2].events.expectFungibleTokenTransferEvent(
      100,
      player.address,
      contract,
      assetId
    );
    block.receipts[2].result.expectOk().expectAscii("COSMETIC_BOUGHT");
  },
});

Clarinet.test({
  name: "Ensure that player cannot buy tokens from stx that is not available in store",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "vbucks-game",
        "buy-tokens",
        [types.uint(1)],
        player.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(106);
  },
});

Clarinet.test({
  name: "Ensure that player cannot buy tokens from stx",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    const contract = `${deployer.address}.velocity-ft`;
    const assetId = `${contract}::velocity-bucks`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "vbucks-game",
        "buy-tokens",
        [types.uint(0)],
        player.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectAscii("TOKENS_BOUGHT");
    block.receipts[0].events.expectFungibleTokenMintEvent(
      500,
      player.address,
      assetId
    );
    block.receipts[0].events.expectSTXTransferEvent(
      5000,
      player.address,
      contract
    );
  },
});
