
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Allows to send x2price to seller-deposit by anyone",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const id = 10;
        const amount = 100;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(amount)], wallet_1.address)
        ]);

        // The depositing by seller should be succesful.
        block.receipts[0].result.expectOk().expectBool(true);
        // There should be a STX transfer of the amount specified.
        console.log(block.receipts);
        block.receipts[0].events.expectSTXTransferEvent(amount, wallet_1.address, `${deployer.address}.escrow`);
    }
});

Clarinet.test({
    name: "Do not allow to do seller-deposit twice to the same order id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const id = 10;
        const amount = 100;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(amount)], wallet_1.address),
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(amount)], wallet_1.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr().expectUint(104);
    }
});

Clarinet.test({
    name: "Allow to do seller-deposit more then once by the sane account for different order id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const id1 = 10;
        const id2 = 11;
        const amount = 100;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id1), types.uint(amount)], wallet_1.address),
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id2), types.uint(amount)], wallet_1.address)
        ]);

        block.receipts.map(receipt => receipt.result.expectOk().expectBool(true));
    }
});

Clarinet.test({
    name: "Do not allow to do buyer-deposit before seller-deposit",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const id = 10;
        const amount = 100;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(amount)], wallet_1.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(103);
        assertEquals(block.receipts[0].events.length, 0);
    }
});

Clarinet.test({
    name: "Allow to do buyer-deposit after seller-deposit multiple time for different products ids",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id1 = 10;
        const id2 = 11;
        const x2price = 100;
        const amount = x2price + 1;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id1), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id2), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id1), types.uint(amount)], wallet_2.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id2), types.uint(amount)], wallet_2.address)
        ]);

        // console.log(JSON.stringify(block.receipts[4].events))
        block.receipts.map(receipt => receipt.result.expectOk().expectBool(true));
        block.receipts[0].events.expectSTXTransferEvent(x2price, wallet_1.address, `${deployer.address}.escrow`);
        block.receipts[1].events.expectSTXTransferEvent(x2price, wallet_1.address, `${deployer.address}.escrow`);

        // Check that buyers account charge on the x2price specified by seller even if buyer specify amount > x2price
        block.receipts[2].events.expectSTXTransferEvent(x2price, wallet_2.address, `${deployer.address}.escrow`);
        block.receipts[3].events.expectSTXTransferEvent(x2price, wallet_2.address, `${deployer.address}.escrow`);
    }
});

Clarinet.test({
    name: "Do not allow to do buyer-deposit on amount less then x2price transfered to sellers-deposit",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id = 10;
        const x2price = 100;
        const amount = x2price - 1;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(amount)], wallet_2.address),
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr().expectUint(107);
    }
});

Clarinet.test({
    name: "Do not allow to do buyer-deposit twice to the same order id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id = 10;
        const x2price = 100;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(x2price)], wallet_2.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(x2price)], wallet_2.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectErr().expectUint(102);
    }
});

Clarinet.test({
    name: "Do not allow to do buyer-deposit if buyer account = seller account",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;
        const id = 10;
        const x2price = 100;
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr().expectUint(108);
    }
});

Clarinet.test({
    name: "Allow to do break-deal by seller at any time after seller-deposit",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id = 10;
        const x2price = 100;
        const amount = x2price + 1;
 
        // break-deal before buyer-deposit
        var block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'break-deal', [types.uint(id)], wallet_1.address)
        ]);
        
        block.receipts.map(receipt => receipt.result.expectOk().expectBool(true));
        assertEquals(block.receipts.length, 2);
        block.receipts[0].events.expectSTXTransferEvent(x2price, wallet_1.address, `${deployer.address}.escrow`);
        block.receipts[1].events.expectSTXTransferEvent(x2price, `${deployer.address}.escrow`, wallet_1.address);
        
        // break-deal after buyer-deposit
        var block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(amount)], wallet_2.address),
            Tx.contractCall('escrow', 'break-deal', [types.uint(id)], wallet_1.address)
        ]);
        
        block.receipts.map(receipt => receipt.result.expectOk().expectBool(true));
        block.receipts[0].events.expectSTXTransferEvent(x2price, wallet_1.address, `${deployer.address}.escrow`);
        block.receipts[1].events.expectSTXTransferEvent(x2price, wallet_2.address, `${deployer.address}.escrow`);
        block.receipts[2].events.expectSTXTransferEvent(x2price, `${deployer.address}.escrow`, wallet_1.address);
        block.receipts[2].events.expectSTXTransferEvent(x2price, `${deployer.address}.escrow`, wallet_2.address);
    }
});

Clarinet.test({
    name: "Do not allow to do break-deal by anyone except seller",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id = 10;
        const x2price = 100;
        const amount = x2price + 1;
 
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(amount)], wallet_2.address),
            Tx.contractCall('escrow', 'break-deal', [types.uint(id)], wallet_2.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectErr().expectUint(100);
    }
});

Clarinet.test({
    name: "Allow to do confirm-deal by buyer after  buyer and seller deposits started",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id = 10;
        const x2price = 100;
        const amount = x2price + 100;
        
        // break-deal after buyer-deposit
        var block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(amount)], wallet_2.address),
            Tx.contractCall('escrow', 'confirm-deal', [types.uint(id)], wallet_2.address)
        ]);

        block.receipts.map(receipt => receipt.result.expectOk().expectBool(true));
        block.receipts[0].events.expectSTXTransferEvent(x2price, wallet_1.address, `${deployer.address}.escrow`);
        block.receipts[1].events.expectSTXTransferEvent(x2price, wallet_2.address, `${deployer.address}.escrow`);
        // price of product 1/2* 100 = 50
        // x2price is amount that should be transfered to deposit by seller and buyer
        // seller got 3/2 of order x2price buyer got 1/2 of order x2price 
        block.receipts[2].events.expectSTXTransferEvent(3 / 2 * x2price, `${deployer.address}.escrow`, wallet_1.address);
        block.receipts[2].events.expectSTXTransferEvent(1 / 2 * x2price, `${deployer.address}.escrow`, wallet_2.address);
    }
});

Clarinet.test({
    name: "Do not allow to do confirm-deal by anyone except buyer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;
        const id = 10;
        const x2price = 100;
        const amount = x2price + 1;
 
        const block = chain.mineBlock([
            Tx.contractCall('escrow', 'seller-deposit', [types.uint(id), types.uint(x2price)], wallet_1.address),
            Tx.contractCall('escrow', 'buyer-deposit', [types.uint(id), types.uint(amount)], wallet_2.address),
            Tx.contractCall('escrow', 'confirm-deal', [types.uint(id)], wallet_1.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectErr().expectUint(101);
    }
});
