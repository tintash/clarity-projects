
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