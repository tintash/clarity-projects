
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that funds transfered to the escrow contract by buyer and seller",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const buyer = accounts.get('wallet_1')!;
        const seller = accounts.get('wallet_2')!;
        const deployer = accounts.get('deployer')!;
        const item_amount = 100;
        const seller_amount = item_amount + 50

        let assetMaps = chain.getAssetsMaps();
        const balance_buyer = assetMaps.assets["STX"][buyer.address];
        const balance_seller = assetMaps.assets["STX"][seller.address];   
        
        
        
        let block = chain.mineBlock([
            Tx.contractCall('escrow', 'buyItem',[types.uint(item_amount), types.principal(seller.address)], buyer.address),
            Tx.contractCall('escrow', 'transferFunds',[types.uint(item_amount)], seller.address),
            Tx.contractCall('escrow', 'itemRecieved',[], buyer.address)

         ]);


        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[0].events.expectSTXTransferEvent(item_amount, buyer.address, `${deployer.address}.escrow`);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[1].events.expectSTXTransferEvent(item_amount, seller.address, `${deployer.address}.escrow`);
        block.receipts[2].result.expectOk().expectBool(true)
        block.receipts[2].events.expectSTXTransferEvent(seller_amount,`${deployer.address}.escrow`, seller.address);
        block.receipts[2].events.expectSTXTransferEvent(item_amount/2,`${deployer.address}.escrow`, buyer.address);

        assetMaps = chain.getAssetsMaps();
        console.log(`Seller balance: ${assetMaps.assets["STX"][seller.address]}`)
        console.log(`Buyer balance: ${assetMaps.assets["STX"][buyer.address]}`)
    },
});


// Clarinet.test({
//     name: "Ensure that item received and contrat cleared out the funds to seller and buyer",
//     async fn(chain: Chain, accounts: Map<string, Account>) {

//         const buyer = accounts.get('wallet_1')!;
//         const seller = accounts.get('wallet_2')!;
//         const deployer = accounts.get('deployer')!;
//         let assetMaps = chain.getAssetsMaps();
//         const balance_buyer = assetMaps.assets["STX"][buyer.address];
//         const balance_seller = assetMaps.assets["STX"][seller.address];
        
//         const item_amount = 100;
//         let sellerAmount = item_amount / 2 + item_amount;

//         let block = chain.mineBlock([
//             Tx.contractCall('escrow', 'itemRecieved',[], buyer.address)
//         ]);
//         block.receipts[0].result.expectOk().expectBool(true);
//         block.receipts[0].events.expectSTXTransferEvent(sellerAmount, `${deployer.address}.escrow`, seller.address);
//         block.receipts[0].events.expectSTXTransferEvent(item_amount/2, `${deployer.address}.escrow`, buyer.address);


//         assetMaps = chain.getAssetsMaps();
//         assertEquals(assetMaps.assets["STX"][seller.address], balance_seller + sellerAmount);
//         assertEquals(assetMaps.assets["STX"][seller.address], balance_buyer + item_amount/2);

//     },
// });