
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.10.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that valid contract owner can be added and can call get-sum-updated function",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!
        const trait = `${deployer.address}.data-contract`

        let block = chain.mineBlock([
            Tx.contractCall(
                'data-contract',
                'add-valid-caller',
                [types.principal(`${deployer.address}.updated-app-contract`)],
                deployer.address
            )]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height,2);
        block.receipts[0].result.expectOk(); 

        block = chain.mineBlock([
            Tx.contractCall(
                'updated-app-contract',
                'get-sum-updated',
                [
                    types.principal (trait),
                    types.uint(1),
                    types.uint(2),
                    types.uint(3)
                ],
                deployer.address
            )
        ])
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 3);
        block.receipts[0].result.expectOk()
    },
});

Clarinet.test({
    name: "Ensure that invalid contract owner cannot call get-sum-updated function",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!
        const trait = `${deployer.address}.data-contract`

        let block = chain.mineBlock([
            Tx.contractCall(
                'updated-app-contract',
                'get-sum-updated',
                [
                    types.principal (trait),
                    types.uint(1),
                    types.uint(2),
                    types.uint(3)
                ],
                deployer.address
            )
        ])
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectErr().expectUint(2)
    },
});
