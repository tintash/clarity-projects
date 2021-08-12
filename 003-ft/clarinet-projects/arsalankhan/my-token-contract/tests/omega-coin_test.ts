
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that transfer can be done between two stacks principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const sender = accounts.get('deployer')!;
        const recepient = accounts.get('wallet_1')!;
        const omegaCoins = 10;
        let memo = new ArrayBuffer(34);
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'transfer', [types.uint(omegaCoins), types.principal(sender.address), types.principal(recepient.address), types.none()], sender.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true)
    },
});

Clarinet.test({
    name: "Ensure sender doest not have enough balance to transfer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const recepient = accounts.get('deployer')!;
        const sender = accounts.get('wallet_1')!;
        const omegaCoins = 10;
        let memo = new ArrayBuffer(34);
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'transfer', [types.uint(omegaCoins), types.principal(sender.address), types.principal(recepient.address), types.none()], sender.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(1)
    },
});

Clarinet.test({
    name: "Ensure that sender and recepient cant be same",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const recepient = accounts.get('deployer')!;
        const sender = accounts.get('deployer')!;
        const omegaCoins = 10;
        let memo = new ArrayBuffer(34);
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'transfer', [types.uint(omegaCoins), types.principal(sender.address), types.principal(recepient.address), types.none()], sender.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(2)
    },
});

Clarinet.test({
    name: "Ensure that minting of new coins can be done by the Token Owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const recepient = accounts.get('wallet_1')!;
        const deployer = accounts.get('deployer')!;
        const omegaCoins = 10;        


        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'mint', [types.uint(omegaCoins), types.principal(recepient.address)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true)
        const assetMaps = chain.getAssetsMaps();
        assertEquals(assetMaps.assets[".omega-coin.omegacoins"][recepient.address], omegaCoins);
    },
});

Clarinet.test({
    name: "Ensure that selling omega tokens can only be done by any principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const omegaCoins = 10;
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'buy-omega', [types.uint(omegaCoins)], wallet_1.address),
            Tx.contractCall('omega-coin', 'sell-omega', [types.uint(omegaCoins)], wallet_1.address)
        ]);

        block.receipts[1].result.expectOk().expectBool(true)
    },
});

Clarinet.test({
    name: "Ensure that buying of omega tokens can be done by any principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const amount = 5;
        const deployer = accounts.get('deployer')!;
        const contract = `${deployer.address}.omega-coin`
        const asset = `${deployer.address}.omega-coin::omegacoins`;

        

        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'buy-omega', [types.uint(amount)], wallet_1.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true)
        block.receipts[0].events.expectSTXTransferEvent(amount * 1000, wallet_1.address, contract);
        block.receipts[0].events.expectFungibleTokenTransferEvent(amount, contract, wallet_1.address, asset)
    },
});



Clarinet.test({
    name: "Ensure that changing price of omega tokens can only be done by contract deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        const newPrice = 15000;
        

        let block = chain.mineBlock([
            Tx.contractCall('omega-coin', 'change-price', [types.uint(newPrice)], deployer.address),
            Tx.contractCall('omega-coin', 'change-price', [types.uint(newPrice)], wallet_1.address)
        ])

        block.receipts[0].result.expectOk().expectBool(true)
        block.receipts[1].result.expectErr().expectUint(2000)
    },
});