
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that funds transfered to the escrow contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const buyer = accounts.get('wallet_1')!;
        const seller = accounts.get('wallet_2')!;
        const deployer = accounts.get('deployer')!  ;
        const amount = 100;
        console.log(buyer);
        let block = chain.mineBlock([
            Tx.contractCall('escrow', 'send-funds',[types.uint(amount), types.principal(seller.address)], buyer.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[0].events.expectSTXTransferEvent(amount, buyer.address, `${deployer.address}.escrow`);
    },
});

Clarinet.test({
    name: "Ensure that item received and contrat cleared out the funds to seller",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const buyer = accounts.get('wallet_1')!;
        const seller = accounts.get('wallet_2')!;
        const deployer = accounts.get('deployer')!;
        let assetMaps = chain.getAssetsMaps();
        const balance = assetMaps.assets["STX"][seller.address];
        const amount = 100;
        console.log(buyer);

        let block = chain.mineBlock([
            Tx.contractCall('escrow', 'itemRecieved',[], buyer.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[0].events.expectSTXTransferEvent(amount, `${deployer.address}.escrow`, seller.address);

        assetMaps = chain.getAssetsMaps();
        assertEquals(assetMaps.assets["STX"][seller.address], balance + amount);
    },
});