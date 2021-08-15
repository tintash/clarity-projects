import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

Clarinet.test({
  name: "Ensure that the  data contract depolyer can register a valid app contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.product-data`,
        "add-valid-contract-caller",
        [types.principal(`${deployer.address}.product-app`)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that the no principal other than data contract depolyer can register a valid contract caller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        `${deployer.address}.product-data`,
        "add-valid-contract-caller",
        [types.principal(`${deployer.address}.product-app`)],
        wallet1.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "Ensure that invalid contract can't add product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;
    const amount = 10;

    let block = chain.mineBlock([
      Tx.contractCall(
        appContract,
        "add-product",
        [
          types.principal(dataContract),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "Ensure that invalid contract can't delete product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const invalidContract = `${deployer.address}.updated-product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(10)],
        transactionSender.address
      ),
      Tx.contractCall(
        invalidContract,
        "delete-product",
        [types.principal(dataContract), types.ascii("Candy")],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "Ensure that invalid contract can't get price of product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const invalidContract = `${deployer.address}.updated-product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(10)],
        transactionSender.address
      ),
      Tx.contractCall(
        invalidContract,
        "get-product-price",
        [types.principal(dataContract), types.ascii("Candy")],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "Ensure that invalid contract can't get update price of product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const invalidContract = `${deployer.address}.updated-product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(10)],
        transactionSender.address
      ),
      Tx.contractCall(
        invalidContract,
        "update-product-price",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(50)],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "Ensure that valid contract can add product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;
    const amount = 10;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [
          types.principal(dataContract),
          types.ascii("Candy"),
          types.uint(amount),
        ],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that valid contract can delete product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(10)],
        transactionSender.address
      ),
      Tx.contractCall(
        appContract,
        "delete-product",
        [types.principal(dataContract), types.ascii("Candy")],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "Ensure that valid contract can get price of product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(10)],
        transactionSender.address
      ),
      Tx.contractCall(
        appContract,
        "get-product-price",
        [types.principal(dataContract), types.ascii("Candy")],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectOk().expectUint(10);
  },
});

Clarinet.test({
  name: "Ensure that valid contract can update price of product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const appContract = `${deployer.address}.product-app`;
    const dataContract = `${deployer.address}.product-data`;
    const transactionSender = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        dataContract,
        "add-valid-contract-caller",
        [types.principal(appContract)],
        deployer.address
      ),
      Tx.contractCall(
        appContract,
        "add-product",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(10)],
        transactionSender.address
      ),
      Tx.contractCall(
        appContract,
        "update-product-price",
        [types.principal(dataContract), types.ascii("Candy"), types.uint(50)],
        transactionSender.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(200);
    block.receipts[1].result.expectOk().expectUint(200);
    block.receipts[2].result.expectOk().expectUint(200);
  },
});
