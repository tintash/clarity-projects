
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that only data-contract deployer can allow contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!
        const updatedAppContract = `${deployer.address}.updated-app-contract`
        const wallet_1 = accounts.get('wallet_1')!;
        let block = chain.mineBlock([
            
            //Add transactions with: 
            Tx.contractCall('data-contract', 'allow-contract', [types.principal(updatedAppContract)], wallet_1.address),
        ]);

        block.receipts[0].result.expectErr().expectUint(301);
    },
});

