
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that updated-app-contract is not valid",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!
        const dataTrait = `${deployer.address}.data-contract`
        const updatedAppContract = `${deployer.address}.updated-app-contract`
        let a = 15;
        let b = 25;
        let block = chain.mineBlock([
            
            //Add transactions with: 
            Tx.contractCall('updated-app-contract', 'app-add', [types.principal(dataTrait), types.uint(a), types.uint(b)], deployer.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(101);
    },
});

Clarinet.test({
    name: "Ensure that updated-app-contract becomes valid once allowed by data-contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!
        const dataTrait = `${deployer.address}.data-contract`
        const updatedAppContract = `${deployer.address}.updated-app-contract`
        let a = 15;
        let b = 25;
        let block = chain.mineBlock([
            
            //Add transactions with: 
            Tx.contractCall('data-contract', 'allow-contract', [types.principal(updatedAppContract)], deployer.address),
            Tx.contractCall('updated-app-contract', 'app-add', [types.principal(dataTrait), types.uint(a), types.uint(b)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectUint(a+b)
    },
});

