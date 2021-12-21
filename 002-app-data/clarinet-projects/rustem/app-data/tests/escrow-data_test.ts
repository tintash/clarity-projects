
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "only contract owner can set/delete contract authorized principals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const seller = accounts.get('wallet_1')!;
        const buyer = accounts.get('wallet_2')!;
        const block = chain.mineBlock([
            Tx.contractCall ('escrow-data', 'set-caller', 
                [types.principal(`${seller.address}.escrow-v1`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-data', 'delete-caller', 
                [types.principal(`${seller.address}.escrow-v1`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-data', 'set-caller', 
                [types.principal(`${deployer.address}.escrow-v1`)],
                buyer.address
            ),
            Tx.contractCall ('escrow-data', 'delete-caller', 
                [types.principal(`${deployer.address}.escrow-v1`)],
                buyer.address
            ),
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectErr().expectUint(100);
        block.receipts[3].result.expectErr().expectUint(100);
    },
});

Clarinet.test({
    name: "unauthorized contract principal can not call restricted contract functions",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const seller = accounts.get('wallet_1')!;
        const buyer = accounts.get('wallet_2')!;
        const orderId = 10;
        const x2price = 100;
        const block = chain.mineBlock([
            Tx.contractCall ('escrow-v1', 'seller-deposit', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                seller.address
            ),
            Tx.contractCall ('escrow-v1', 'buyer-deposit', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                buyer.address
            ),
            Tx.contractCall ('escrow-v1', 'confirm-deal', 
            [types.principal(`${deployer.address}.escrow-data`),
            types.uint(orderId)],
            buyer.address
            ),
        ]);
        block.receipts[0].result.expectErr().expectUint(101);
        block.receipts[1].result.expectErr().expectUint(203);
        block.receipts[2].result.expectErr().expectUint(203);
    },
});

Clarinet.test({
    name: "full success flow till confirm-deal for escrow-v1 contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const seller = accounts.get('wallet_1')!;
        const buyer = accounts.get('wallet_2')!;
        const orderId = 10;
        const x2price = 100;
        const block = chain.mineBlock([
            Tx.contractCall ('escrow-data', 'set-caller',
                [types.principal(`${deployer.address}.escrow-v1`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-v1', 'seller-deposit', 
            [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                seller.address
            ),
            Tx.contractCall ('escrow-v1', 'buyer-deposit', 
            [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                buyer.address
            ),
            Tx.contractCall ('escrow-v1', 'confirm-deal', 
            [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId)],
                buyer.address
                ),
            ]);
            block.receipts.map(receipt => receipt.result.expectOk().expectBool(true));
            assertEquals(block.receipts.length, 4);
            assertEquals(block.receipts[0].events, []);
            block.receipts[1].events.expectSTXTransferEvent(x2price, seller.address, `${deployer.address}.escrow-data`);
            block.receipts[2].events.expectSTXTransferEvent(x2price, buyer.address, `${deployer.address}.escrow-data`);
            block.receipts[3].events.expectSTXTransferEvent(3 / 2 * x2price, `${deployer.address}.escrow-data`, seller.address);
            block.receipts[3].events.expectSTXTransferEvent(1 / 2 * x2price, `${deployer.address}.escrow-data`, buyer.address);
        },
    });
    
    Clarinet.test({
        name: "set discount can be called only by seller after seller-deposit",
        async fn(chain: Chain, accounts: Map<string, Account>) {
            const deployer = accounts.get('deployer')!;
            const seller = accounts.get('wallet_1')!;
            const buyer = accounts.get('wallet_2')!;
            const orderId = 10;
            const x2price = 100;
            const discount = x2price / 2;
            const block = chain.mineBlock([
                Tx.contractCall ('escrow-data', 'set-caller', 
                    [types.principal(`${deployer.address}.escrow-v1`)],
                    deployer.address
                ),
                // should fail because seller have to transfer to deposit first
                Tx.contractCall ('escrow-v2', 'set-discount', 
                    [types.principal(`${deployer.address}.escrow-data`),
                    types.uint(orderId), types.uint(discount)],
                    seller.address
                ),
                Tx.contractCall ('escrow-v2', 'seller-deposit', 
                    [types.principal(`${deployer.address}.escrow-data`),
                    types.uint(orderId), types.uint(x2price)],
                    seller.address
                ),
                // should fail because only seller can set discount
                Tx.contractCall ('escrow-v2', 'set-discount', 
                    [types.principal(`${deployer.address}.escrow-data`),
                    types.uint(orderId), types.uint(discount)],
                    buyer.address
                ),
                // should pass because seller transfered to deposit first
                Tx.contractCall ('escrow-v2', 'set-discount', 
                    [types.principal(`${deployer.address}.escrow-data`),
                    types.uint(orderId), types.uint(discount)],
                    seller.address
                ),
                // should fail because discount can't be bigger then price
                Tx.contractCall ('escrow-v2', 'set-discount', 
                    [types.principal(`${deployer.address}.escrow-data`),
                    types.uint(orderId), types.uint(1)],
                    seller.address
                ),
                Tx.contractCall ('escrow-v2', 'delete-discount', 
                    [types.principal(`${deployer.address}.escrow-data`),
                    types.uint(orderId)],
                    seller.address
                ),
            ]);
            block.receipts[0].result.expectOk().expectBool(true);
            block.receipts[1].result.expectErr().expectUint(203);
            block.receipts[2].result.expectOk().expectBool(true);
            block.receipts[3].result.expectErr().expectUint(200);
            block.receipts[4].result.expectOk().expectUint(orderId);
            block.receipts[5].result.expectErr().expectUint(210);
            block.receipts[6].result.expectOk().expectUint(orderId);
        },
    });

Clarinet.test({
    name: "full success flow till confirm-deal for escrow-v2 contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const seller = accounts.get('wallet_1')!;
        const buyer = accounts.get('wallet_2')!;
        const orderId = 10;
        const x2price = 100;
        const discount = 30;
        // Check that before buyer/seller deposit all contracts do not have any funds
        var escrow_data_deposit = chain.callReadOnlyFn('escrow-data', 'total-contract-deposit',
                                                       [], deployer.address);
        escrow_data_deposit.result.expectUint(0);
        var escrow_v1_deposit = chain.callReadOnlyFn('escrow-v1', 'total-contract-deposit',
                                                       [], deployer.address);
        escrow_v1_deposit.result.expectUint(0);
        var escrow_v2_deposit = chain.callReadOnlyFn('escrow-v2', 'total-contract-deposit',
                                                       [], deployer.address);
        escrow_v2_deposit.result.expectUint(0);
        const block = chain.mineBlock([
            Tx.contractCall ('escrow-data', 'set-caller',
                [types.principal(`${deployer.address}.escrow-v1`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-data', 'set-caller',
                [types.principal(`${deployer.address}.escrow-v2`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-v2', 'seller-deposit', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                seller.address
            ),
            Tx.contractCall ('escrow-v2', 'set-discount', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(discount)],
                seller.address
            ),
            Tx.contractCall ('escrow-v2', 'buyer-deposit', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                buyer.address
            ),
        ]);

        // Only escrow-data contract should get all the funds
        escrow_data_deposit = chain.callReadOnlyFn('escrow-data', 'total-contract-deposit',
                                                   [], deployer.address);
        escrow_data_deposit.result.expectUint(2 * x2price);
        escrow_v1_deposit = chain.callReadOnlyFn('escrow-v1', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v1_deposit.result.expectUint(0);
        escrow_v2_deposit = chain.callReadOnlyFn('escrow-v2', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v2_deposit.result.expectUint(0);
 
        const block1 = chain.mineBlock([
            Tx.contractCall ('escrow-v2', 'confirm-deal', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId)],
                buyer.address
            ),
        ]);

        // Check that confirm-deal all contracts do not have any funds
        escrow_data_deposit = chain.callReadOnlyFn('escrow-data', 'total-contract-deposit',
                                                   [], deployer.address);
        escrow_data_deposit.result.expectUint(0);
        escrow_v1_deposit = chain.callReadOnlyFn('escrow-v1', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v1_deposit.result.expectUint(0);
        escrow_v2_deposit = chain.callReadOnlyFn('escrow-v2', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v2_deposit.result.expectUint(0);
        // console.log(JSON.stringify(block.receipts[1].events));
 
        block.receipts.filter((receipt, index) => index != 3)
        .map(receipt => receipt.result.expectOk().expectBool(true));
        assertEquals(block.receipts.length, 5);
        assertEquals(block.receipts[0].events, []);
        assertEquals(block.receipts[1].events, []);
        block.receipts[2].events.expectSTXTransferEvent(x2price, seller.address, `${deployer.address}.escrow-data`);
        assertEquals(block.receipts[3].events, []);
        block.receipts[4].events.expectSTXTransferEvent(x2price, buyer.address, `${deployer.address}.escrow-data`);
        block1.receipts[0].events.expectSTXTransferEvent(3 / 2 * x2price - discount, `${deployer.address}.escrow-data`, seller.address);
        block1.receipts[0].events.expectSTXTransferEvent(1 / 2 * x2price + discount, `${deployer.address}.escrow-data`, buyer.address);
    },
});

Clarinet.test({
    name: "full success flow till break-deal for escrow-v2 contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const seller = accounts.get('wallet_1')!;
        const buyer = accounts.get('wallet_2')!;
        const orderId = 10;
        const x2price = 100;
        const discount = 30;
        // Check that before buyer/seller deposit all contracts do not have any funds
        var escrow_data_deposit = chain.callReadOnlyFn('escrow-data', 'total-contract-deposit',
                                                       [], deployer.address);
        escrow_data_deposit.result.expectUint(0);
        var escrow_v1_deposit = chain.callReadOnlyFn('escrow-v1', 'total-contract-deposit',
                                                       [], deployer.address);
        escrow_v1_deposit.result.expectUint(0);
        var escrow_v2_deposit = chain.callReadOnlyFn('escrow-v2', 'total-contract-deposit',
                                                       [], deployer.address);
        escrow_v2_deposit.result.expectUint(0);
        const block = chain.mineBlock([
            Tx.contractCall ('escrow-data', 'set-caller',
                [types.principal(`${deployer.address}.escrow-v1`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-data', 'set-caller',
                [types.principal(`${deployer.address}.escrow-v2`)],
                deployer.address
            ),
            Tx.contractCall ('escrow-v2', 'seller-deposit', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                seller.address
            ),
            Tx.contractCall ('escrow-v2', 'set-discount', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(discount)],
                seller.address
            ),
            Tx.contractCall ('escrow-v2', 'buyer-deposit', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId), types.uint(x2price)],
                buyer.address
            ),
        ]);

        // Only escrow-data contract should get all the funds
        escrow_data_deposit = chain.callReadOnlyFn('escrow-data', 'total-contract-deposit',
                                                   [], deployer.address);
        escrow_data_deposit.result.expectUint(2 * x2price);
        escrow_v1_deposit = chain.callReadOnlyFn('escrow-v1', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v1_deposit.result.expectUint(0);
        escrow_v2_deposit = chain.callReadOnlyFn('escrow-v2', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v2_deposit.result.expectUint(0);
 
        const block1 = chain.mineBlock([
            Tx.contractCall ('escrow-v2', 'break-deal', 
                [types.principal(`${deployer.address}.escrow-data`),
                types.uint(orderId)],
                seller.address
            ),
        ]);

        // Check that break-deal all contracts do not have any funds
        escrow_data_deposit = chain.callReadOnlyFn('escrow-data', 'total-contract-deposit',
                                                   [], deployer.address);
        escrow_data_deposit.result.expectUint(0);
        escrow_v1_deposit = chain.callReadOnlyFn('escrow-v1', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v1_deposit.result.expectUint(0);
        escrow_v2_deposit = chain.callReadOnlyFn('escrow-v2', 'total-contract-deposit',
                                                 [], deployer.address);
        escrow_v2_deposit.result.expectUint(0);
        // console.log(JSON.stringify(block.receipts[1].events));
 
        block.receipts.filter((receipt, index) => index != 3)
        .map(receipt => receipt.result.expectOk().expectBool(true));
        assertEquals(block.receipts.length, 5);
        assertEquals(block.receipts[0].events, []);
        assertEquals(block.receipts[1].events, []);
        block.receipts[2].events.expectSTXTransferEvent(x2price, seller.address, `${deployer.address}.escrow-data`);
        assertEquals(block.receipts[3].events, []);
        block.receipts[4].events.expectSTXTransferEvent(x2price, buyer.address, `${deployer.address}.escrow-data`);
        block1.receipts[0].events.expectSTXTransferEvent(x2price, `${deployer.address}.escrow-data`, seller.address);
        block1.receipts[0].events.expectSTXTransferEvent(x2price, `${deployer.address}.escrow-data`, buyer.address);
    },
});