import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

Clarinet.test({
  name: "Ensure that contract-owner can add product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const storeContract = `${deployer.address}.product-store`;
    const amount = 10;

    let block = chain.mineBlock([
      Tx.contractCall(
        storeContract,
        "add-product",
        [types.ascii("Candy"), types.uint(amount), types.uint(50)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that contract owner can delete product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const storeContract = `${deployer.address}.product-store`;
    const amount = 10;

    let block = chain.mineBlock([
      Tx.contractCall(
        storeContract,
        "add-product",
        [types.ascii("Candy"), types.uint(amount), types.uint(50)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "delete-product",
        [types.ascii("Candy")],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that user can get price of product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const storeContract = `${deployer.address}.product-store`;
    const amount = 10;

    let block = chain.mineBlock([
      Tx.contractCall(
        storeContract,
        "add-product",
        [types.ascii("Candy"), types.uint(amount), types.uint(50)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "get-product-price",
        [types.ascii("Candy")],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(amount);
  },
});

Clarinet.test({
  name: "Ensure that user can buy product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const storeContract = `${deployer.address}.product-store`;
    const amount = 10;

    let block = chain.mineBlock([
      Tx.contractCall(
        storeContract,
        "add-product",
        [types.ascii("Candy"), types.uint(amount), types.uint(50)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "buy-product",
        [types.ascii("Candy"), types.uint(amount)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[1].events.expectFungibleTokenMintEvent(
      amount * 1000,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
    block.receipts[1].events.expectSTXTransferEvent(
      amount,
      deployer.address,
      storeContract
    );
  },
});

Clarinet.test({
  name: "Ensure that user can transfer token to some other user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const storeContract = `${deployer.address}.product-store`;
    const amount = 10;
    const tokens = amount * 1000;

    let block = chain.mineBlock([
      Tx.contractCall(
        storeContract,
        "add-product",
        [types.ascii("Candy"), types.uint(amount), types.uint(50)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "buy-product",
        [types.ascii("Candy"), types.uint(amount)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "transfer-reward-tokens",
        [types.uint(tokens), types.principal(wallet1.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectOk().expectUint(200);
    block.receipts[2].events.expectFungibleTokenTransferEvent(
      tokens,
      deployer.address,
      wallet1.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
  },
});

Clarinet.test({
  name: "Ensure that user can transfer token to some other user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const storeContract = `${deployer.address}.product-store`;
    const amount = 10;
    const tokens = amount * 1000;

    let block = chain.mineBlock([
      Tx.contractCall(
        storeContract,
        "add-product",
        [types.ascii("Candy"), types.uint(amount), types.uint(50)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "buy-product",
        [types.ascii("Candy"), types.uint(amount)],
        deployer.address
      ),
      Tx.contractCall(
        storeContract,
        "redeem-reward-tokens",
        [types.uint(tokens)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectOk().expectUint(200);
    block.receipts[2].events.expectFungibleTokenBurnEvent(
      tokens,
      deployer.address,
      `${deployer.address}.cosmo-ft::cosmo-ft`
    );
    block.receipts[2].events.expectSTXTransferEvent(
      amount,
      storeContract,
      deployer.address
    );
  },
});
