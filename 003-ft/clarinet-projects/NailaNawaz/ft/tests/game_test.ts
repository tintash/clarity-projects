
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that player can't play game with not enough coins",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let block = chain.mineBlock([
            Tx.contractCall(
                "game",
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
                "game",
                "register-user",
                [types.principal(deployer.address)],
                deployer.address
            ),

            Tx.contractCall (
                "game",
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


Clarinet.test({
    name: "Ensure that some coins are minted or burn when player win or loose game", // (by checking if ft_mint event or ft_burn_event is triggered)
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        let block = chain.mineBlock([
            Tx.contractCall(
                "game",
                "register-user",
                [types.principal(deployer.address)],
                deployer.address
            ),
            Tx.contractCall (
                "game",
                "play-game",
                [],
                deployer.address
            ),
        ]);

        if (!(block.receipts[1].events[1].type === "ft_mint_event" || block.receipts[1].events[1].type === "ft_burn_event" )) {
            throw new Error(`Unable to retrieve expected FungibleTokenMintEvent`);
        }
    },
})

Clarinet.test({
    name: "Ensure that some coins are minted when player register the game", // (by checking if ft_mint event is triggered)
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        let block = chain.mineBlock([
            Tx.contractCall(
                "game",
                "register-user",
                [types.principal(deployer.address)],
                deployer.address
            ),
        ]);

        assertEquals (block.receipts[0].events[0].type, "ft_mint_event");
    },
})
