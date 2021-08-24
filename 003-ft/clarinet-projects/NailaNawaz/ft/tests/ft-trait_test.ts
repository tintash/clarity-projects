
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.10.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that player can't play game with not enough coins",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        let block = chain.mineBlock([
            Tx.contractCall(
                "game-contract",
                "play-game",
                [],
                deployer.address
            )
        ]);
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectBool(false);
        assertEquals(block.height, 2);
    },
});

Clarinet.test({
    name: "Ensure that player can play game with enough coins",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const player = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall(
                "game-contract",
                "register-user",
                [types.principal(deployer.address)],
                deployer.address
            ),

            Tx.contractCall (
                "game-contract",
                "play-game",
                [],
                deployer.address
            )
        ]);
        assertEquals(block.receipts.length, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        assertEquals(block.height, 2);
        console.log(block.receipts[1]) 
        block.receipts[1].result.expectOk().expectBool(true);
    },
});
