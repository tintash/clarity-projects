import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Ensure that set-time-for-proposal can only be called by contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var notContractOwner = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "set-time-for-proposal",
        [types.uint(20)],
        notContractOwner.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(1000);
  },
});

Clarinet.test({
  name: "Ensure that set-member-registration-cost-in-dao can only be called by contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var notContractOwner = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "set-member-registration-cost-in-dao",
        [types.uint(20)],
        notContractOwner.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(1000);
  },
});

Clarinet.test({
  name: "Ensure that member cannot register again",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
    ]);
    block.receipts[1].result.expectErr().expectUint(1002);
  },
});

Clarinet.test({
  name: "Ensure that only member can propose a proposal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var notMember = accounts.get("wallet_1")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        notMember.address
      ),
    ]);
    block.receipts[1].result.expectErr().expectUint(1001);
  },
});

Clarinet.test({
  name: "Ensure that proposer has enough dao to propose",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao-token",
        "transfer?",
        [
          types.uint(100),
          types.principal(member.address),
          types.principal(tokenTrait),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
    ]);
    block.receipts[2].result.expectErr().expectUint(1006);
  },
});

Clarinet.test({
  name: "Ensure that pricipal has enough stx to call add-dao",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "add-dao",
        [types.principal(tokenTrait), types.uint(1_000_000_000_000_000)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(1014);
  },
});

Clarinet.test({
  name: "Ensure that vote can casted by a member",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var notMember = accounts.get("wallet_1")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        notMember.address
      ),
    ]);
    block.receipts[2].result.expectErr().expectUint(1001);
  },
});

Clarinet.test({
  name: "Ensure that vote is casted to a valid proposal id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var notMember = accounts.get("wallet_1")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(2)],
        member.address
      ),
    ]);
    block.receipts[2].result.expectErr().expectUint(1003);
  },
});

Clarinet.test({
  name: "Ensure that vote is casted to an unprocessed proposal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let nextBlock = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    nextBlock.receipts[1].result.expectErr().expectUint(1010);
  },
});

Clarinet.test({
  name: "Ensure that member cannot vote twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);
    block.receipts[3].result.expectErr().expectUint(1011);
  },
});

Clarinet.test({
  name: "Ensure that a valid proposal can be processed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(2)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(1003);
  },
});

Clarinet.test({
  name: "Ensure that a proposal is not already in process before processing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
    ]);

    block.receipts[1].result.expectErr().expectUint(1010);
  },
});

Clarinet.test({
  name: "Ensure that a proposal is ready for processing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
    ]);

    block.receipts[3].result.expectErr().expectUint(1009);
  },
});

Clarinet.test({
  name: "Ensure that at least one proposal is in process before evaluation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "evaluate-processed-proposal-votes",
        [types.principal(tokenTrait)],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(1015);
  },
});

Clarinet.test({
  name: "Ensure that contract has enough dao to evaluate a proposal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "evaluate-processed-proposal-votes",
        [types.principal(tokenTrait)],
        deployer.address
      ),
    ]);

    block.receipts[1].result.expectErr().expectUint(1013);
  },
});

Clarinet.test({
  name: "Ensure that contract executes winning proposal and resets the processed proposals list",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    chain.mineBlock([
      Tx.contractCall(
        "dao",
        "add-dao",
        [types.principal(tokenTrait), types.uint(100000)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "evaluate-processed-proposal-votes",
        [types.principal(tokenTrait)],
        deployer.address
      ),
      Tx.contractCall("dao", "get-processed-proposals", [], deployer.address),
    ]);

    block.receipts[1].result.expectOk().expectUint(1);
    assertEquals("[]", block.receipts[2].result);
  },
});

Clarinet.test({
  name: "Ensure that executed proposal cannot be processed again",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var member = accounts.get("deployer")!;
    var organisation = accounts.get("wallet_2")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    chain.mineBlock([
      Tx.contractCall(
        "dao",
        "add-dao",
        [types.principal(tokenTrait), types.uint(100000)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "propose-proposal",
        [
          types.principal(tokenTrait),
          types.principal(organisation.address),
          types.uint(10000),
        ],
        member.address
      ),
      Tx.contractCall(
        "dao",
        "cast-vote",
        [types.principal(tokenTrait), types.bool(true), types.uint(1)],
        member.address
      ),
    ]);

    chain.mineEmptyBlock(10);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "evaluate-processed-proposal-votes",
        [types.principal(tokenTrait)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "process-proposal",
        [types.uint(1)],
        deployer.address
      ),
    ]);

    block.receipts[1].result.expectOk().expectUint(1);
    block.receipts[2].result.expectErr().expectUint(1008);
  },
});

Clarinet.test({
  name: "Ensure that dao tokens are convertable back to tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    var deployer = accounts.get("deployer")!;
    var tokenTrait = `${deployer.address}.dao-token`;

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao",
        "register-member",
        [types.principal(tokenTrait)],
        deployer.address
      ),
      Tx.contractCall(
        "dao",
        "convert-dao-to-stx",
        [types.principal(tokenTrait), types.uint(10)],
        deployer.address
      ),
    ]);

    block.receipts[1].result.expectOk().expectBool(true);
  },
});
