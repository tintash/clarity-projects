import {
  Clarinet,
  Tx,
  Chain,
  Account,
  Block,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

Clarinet.test({
  name: "Ensure that get-name returns the correct token name",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-name",
      [],
      deployer.address
    );
    receipt.result.expectOk().expectAscii("Cosmo Token");
  },
});

Clarinet.test({
  name: "Ensure that get-symbol returns the correct symbol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-symbol",
      [],
      deployer.address
    );
    receipt.result.expectOk().expectAscii("CTX");
  },
});

Clarinet.test({
  name: "Ensure that get-token-uri works properly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-token-uri",
      [],
      deployer.address
    );
    receipt.result.expectOk().expectSome().expectUtf8("\\u{f09f8c8c}");
  },
});

Clarinet.test({
  name: "Ensure that contract owner can mint new tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const amount = 5000;
    let block: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
  },
});

Clarinet.test({
  name: "Ensure that get-balance-of returns correct balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const amount = 5000;

    const receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-balance-of",
      [types.principal(deployer.address)],
      deployer.address
    );
    receipt.result.expectOk().expectUint(0);

    let block: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "get-balance-of",
        [types.principal(deployer.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
    block.receipts[1].result.expectOk().expectUint(amount);
  },
});

Clarinet.test({
  name: "Ensure that get-total-supply returns correct supply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const amount = 5000;

    let receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-total-supply",
      [],
      deployer.address
    );
    receipt.result.expectOk().expectUint(0);

    let block: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );

    receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-total-supply",
      [],
      deployer.address
    );
    receipt.result.expectOk().expectUint(amount);
  },
});

Clarinet.test({
  name: "Ensure that user can transfer the tokens from one user to another",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const amount = 5000;

    let block1: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
    ]);
    block1.receipts[0].result.expectOk().expectBool(true);
    block1.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );

    let receipt = chain.callReadOnlyFn(
      `${deployer.address}.cosmo-ft`,
      "get-balance-of",
      [types.principal(deployer.address)],
      deployer.address
    );
    receipt.result.expectOk().expectUint(amount);

    let block2: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "transfer",
        [
          types.uint(amount),
          types.principal(deployer.address),
          types.principal(wallet1.address),
        ],
        deployer.address
      ),
    ]);
    block2.receipts[0].result.expectOk().expectBool(true);
    block2.receipts[0].events.expectFungibleTokenTransferEvent(
      amount,
      deployer.address,
      wallet1.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
  },
});

Clarinet.test({
  name: "Ensure that contract owner can add valid contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    let block1: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "add-valid-contract-caller",
        [types.principal(`${deployer.address}.product-store`)],
        deployer.address
      ),
    ]);
    block1.receipts[0].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that contract deployer can destroy tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const amount = 5000;

    let block: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(wallet1.address)],
        deployer.address
      ),
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "destroy-token",
        [types.uint(amount), types.principal(wallet1.address)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      wallet1.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[1].events.expectFungibleTokenBurnEvent(
      amount,
      wallet1.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
  },
});

Clarinet.test({
  name: "Ensure that token owner can destroy his tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const amount = 5000;

    let block: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(wallet1.address)],
        deployer.address
      ),
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "destroy-token",
        [types.uint(amount), types.principal(wallet1.address)],
        wallet1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      wallet1.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[1].events.expectFungibleTokenBurnEvent(
      amount,
      wallet1.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
  },
});

Clarinet.test({
  name: "Ensure that user can't transfer 0 token from one user to another",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const amount = 5000;
    const token = 0;

    let block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "transfer",
        [
          types.uint(token),
          types.principal(deployer.address),
          types.principal(wallet1.address),
        ],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );

    block.receipts[1].result.expectErr().expectUint(3);
  },
});

Clarinet.test({
  name: "Ensure that token can't be tansferred between same principals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const amount = 5000;

    let block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "transfer",
        [
          types.uint(amount),
          types.principal(deployer.address),
          types.principal(deployer.address),
        ],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[0].events.expectFungibleTokenMintEvent(
      amount,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );

    block.receipts[1].result.expectErr().expectUint(2);
  },
});

Clarinet.test({
  name: "Ensure that contract owner can't mint 0 tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const amount = 0;
    let block: Block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.cosmo-ft`,
        "issue-token",
        [types.uint(amount), types.principal(deployer.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(1);
  },
});
