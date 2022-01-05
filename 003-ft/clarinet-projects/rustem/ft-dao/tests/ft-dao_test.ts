
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "only contributors can create proposals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user = accounts.get('wallet_1')!;
        const block = chain.mineBlock([
            Tx.contractCall ('ft-dao', 'create-proposal',
                [types.ascii('Proposition 1'), types.uint(0)],
                user.address
            )
        ]);
        block.receipts[0].result.expectErr().expectUint(103);
    },
});
