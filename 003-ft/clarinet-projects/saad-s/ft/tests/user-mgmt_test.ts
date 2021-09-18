
// @ts-ignore
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
// @ts-ignore
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "user-mgmt -- users can signup and mention referrer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let eReferrer = accounts.get('wallet_1')!;
        let eUser = accounts.get('wallet_2')!;
        let block = chain.mineBlock([
            Tx.contractCall ('user-mgmt', 'signup', 
                [types.ascii('name'), types.principal(eReferrer.address)],
                eUser.address
            ),
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "user-mgmt -- users cannot signup multiple times",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let eReferrer = accounts.get('wallet_1')!;
        let eUser = accounts.get('wallet_2')!;
        let block = chain.mineBlock([
            Tx.contractCall ('user-mgmt', 'signup', 
                [types.ascii('name'), types.principal(eReferrer.address)],
                eUser.address
            ),
            Tx.contractCall ('user-mgmt', 'signup', 
                [types.ascii('name'), types.principal(eReferrer.address)],
                eUser.address
            ),
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr().expectUint(110);
    },
});

Clarinet.test({
    name: "user-mgmt -- users cannot refer themselves",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let eUser = accounts.get('wallet_1')!;
        let block = chain.mineBlock([
            Tx.contractCall ('user-mgmt', 'signup', 
                [types.ascii('name'), types.principal(eUser.address)],
                eUser.address
            ),
        ]);
        block.receipts[0].result.expectErr().expectUint(110);
    },
});

Clarinet.test({
    name: "user-mgmt -- reward is sent to referrer after new user makes transacton",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let eReferrer = accounts.get('wallet_1')!;
        let eUser = accounts.get('wallet_2')!;
        const tokensReward = 10;
        // get initial balance
        let balance = chain.callReadOnlyFn('refer-reward-ft', 'get-balance-of',
            [types.principal(eReferrer.address)], eReferrer.address);
        balance.result.expectOk().expectUint(0);
        
        let block = chain.mineBlock([
            Tx.contractCall ('refer-reward-ft', 'add-caller',
                [types.principal(`${deployer.address}.user-mgmt`)],
                deployer.address
            ),
            Tx.contractCall ('user-mgmt', 'signup', 
                [types.ascii('name'), types.principal(eReferrer.address)],
                eUser.address
            ),
            Tx.contractCall ('user-mgmt', 'complete-transaction', 
                [], eUser.address
            ),
        ]);
        block.receipts[0].result.expectOk().expectBool(true);

        // get balance
        balance = chain.callReadOnlyFn('refer-reward-ft', 'get-balance-of',
            [types.principal(eReferrer.address)], eReferrer.address);
        balance.result.expectOk().expectUint(tokensReward);
    },
});
