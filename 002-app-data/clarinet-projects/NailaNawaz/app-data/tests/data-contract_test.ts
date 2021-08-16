
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.10.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that contract owner can add valid callers",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!
        const appContract = `${deployer.address}.app-contract`

        let block = chain.mineBlock([
            Tx.contractCall(
                'data-contract',
                'add-valid-caller',
                [types.principal(appContract)],
                deployer.address
            )
        ]);
        block.receipts[0].result.expectOk(); 
    },
});

Clarinet.test({
    name: "Ensure that invalid contract owner can not add valid callers",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!
        const appContract = `${wallet1.address}.app-contract`

        let block = chain.mineBlock([
            Tx.contractCall(
                'data-contract',
                'add-valid-caller',
                [types.principal(appContract)],
                wallet1.address
            )
        ]);
        block.receipts[0].result.expectErr().expectUint(0); 
    },
});
