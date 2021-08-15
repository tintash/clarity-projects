
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that data-contract not allowed by invalid contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!
        const dataTrait = `${deployer.address}.data-contract`
        let block = chain.mineBlock([
            
            //Add transactions with: 
            Tx.contractCall('app-contract', 'app-add', [types.principal(dataTrait)], deployer.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(101);
    },
});

Clarinet.test({
    name: "Ensure that data contract allows only valid contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!
        const dataTrait = `${deployer.address}.data-contract`
        const appContract = `${deployer.address}.app-contract`
        let a = 15;
        let b = 25;
        let block = chain.mineBlock([
            
            //Add transactions with: 
            Tx.contractCall('data-contract', 'allow-contract', [types.principal(appContract)], deployer.address),
            Tx.contractCall('app-contract', 'app-update', [types.principal(dataTrait), types.uint(a), types.uint(b)], deployer.address),
            Tx.contractCall('app-contract', 'app-add', [types.principal(dataTrait)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectOk().expectUint(a+b)
    },
});
