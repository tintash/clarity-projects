
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';


Clarinet.test({
    name: "Ensure that selling omega tokens can only be done by contract deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const omegaCoins = 10;
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-contract', 'deposit-omega', [types.uint(omegaCoins)], deployer.address),
            Tx.contractCall('omega-contract', 'deposit-omega', [types.uint(omegaCoins)], wallet_1.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true)
        block.receipts[1].result.expectErr().expectUint(101)
    },
});

Clarinet.test({
    name: "Ensure that buying of omega tokens can be done by any principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const amount = 5;
        const deployer = accounts.get('deployer')!;
        const contract = `${deployer.address}.omega-contract`
        const asset = `${deployer.address}.omega-coin::omegacoins`;

        

        let block = chain.mineBlock([
            Tx.contractCall('omega-contract', 'deposit-omega', [types.uint(amount)], deployer.address),
            Tx.contractCall('omega-contract', 'buy-omega', [types.uint(amount)], wallet_1.address)
        ]);

        block.receipts[1].result.expectOk().expectBool(true)
        block.receipts[1].events.expectSTXTransferEvent(amount * 1000, wallet_1.address, deployer.address);
        block.receipts[1].events.expectFungibleTokenTransferEvent(amount, contract, wallet_1.address, asset)
    },
});



Clarinet.test({
    name: "Ensure that changing price of omega tokens can only be done by contract deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        const newPrice = 15000;
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-contract', 'change-price', [types.uint(newPrice)], deployer.address),
            Tx.contractCall('omega-contract', 'change-price', [types.uint(newPrice)], wallet_1.address)
        ])

        block.receipts[0].result.expectOk().expectBool(true)
        block.receipts[1].result.expectErr().expectUint(101)
    },
});