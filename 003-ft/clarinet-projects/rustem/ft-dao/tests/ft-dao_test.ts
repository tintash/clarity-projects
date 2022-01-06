
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "only contract owner can change dao ft price",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user = accounts.get('wallet_1')!;
        const block = chain.mineBlock([
            // error if not contract owner will try to set dao ft price
            Tx.contractCall ('ft-dao', 'set-ft-price',
            [types.uint(1)],
            user.address
            ),
            // contract owner can change ft price
            Tx.contractCall ('ft-dao', 'set-ft-price',
                [types.uint(1)],
                deployer.address
            ),
        ]);
        block.receipts[0].result.expectErr().expectUint(100);
        block.receipts[1].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "proposals full flow",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const recipient = accounts.get('wallet_4')!;
        const user = accounts.get('wallet_1')!;
        const contributor = accounts.get('wallet_2')!;
        const stakeholder = accounts.get('wallet_3')!;
        const votingPeriod = 1008;
        const block = chain.mineBlock([
            // user that didn't buy dao ft can create proposals
            Tx.contractCall ('ft-dao', 'create-proposal',
            [types.ascii('Proposition 1'), types.uint(0)],
            user.address
            ),
            // user can mint(buy) dao ft paying in STXs
            Tx.contractCall ('ft-dao', 'mint',
            [types.uint(1)],
            contributor.address
            ),
            // user that bought at least one dao ft can create proposal as contributor
            Tx.contractCall ('ft-dao', 'create-proposal',
            [types.ascii('Proposition 1'), types.uint(0)],
            contributor.address
            ),
            // user that bought less than 100 dao fts can't vote proposal
            Tx.contractCall ('ft-dao', 'vote-proposal',
            [types.uint(1), types.bool(true)],
            contributor.address
            ),
            // user that bought >= 100 dao fts became a stakeholder
            Tx.contractCall ('ft-dao', 'mint',
            [types.uint(100)],
            stakeholder.address
            ),
            // error if stakeholders try to vote for unexisting proposals
            Tx.contractCall ('ft-dao', 'vote-proposal',
            [types.uint(2), types.bool(true)],
            stakeholder.address
            ),
            // stakeholders can vote for proposals
            Tx.contractCall ('ft-dao', 'vote-proposal',
            [types.uint(1), types.bool(true)],
            stakeholder.address
            ),
            // error if stakeholder try to vote for proposal again with the same value
            Tx.contractCall ('ft-dao', 'vote-proposal',
                [types.uint(1), types.bool(true)],
                stakeholder.address
            ),
            // user can't get results of voting of proposal while vote still last
            Tx.contractCall ('ft-dao', 'is-proposal-succeeded',
                [types.uint(1)],
                user.address
            ),
            // error if funds from contract will try to transfer not contract owner
            Tx.contractCall ('ft-dao', 'pay-to',
                [types.principal(deployer.address), types.uint(10100)],
                stakeholder.address
            ),
            // funds from contract can be transfered only by contract owner
            Tx.contractCall ('ft-dao', 'pay-to',
                [types.principal(recipient.address), types.uint(10100)],
                deployer.address
            ),
        ]);
        // create-proposal ERR-CONTRIBUTORS-ONLY
        block.receipts[0].result.expectErr().expectUint(103);
        block.receipts[1].result.expectOk().expectBool(true);
        assertEquals(block.receipts[1].events[0]['ft_mint_event'],
                     {asset_identifier: `${deployer.address}.ft-dao::dao-token`,
                      recipient: contributor.address,
                      amount: "1"
                     });
        assertEquals(block.receipts[1].events[1]['contract_event'],
                     {contract_identifier: `${deployer.address}.ft-dao`,
                      topic: "print",
                      value: `{ft-price: u100, num-tokens: u1, tx-sender: ${contributor.address}}`
                     });
        assertEquals(block.receipts[1].events[2]['stx_transfer_event'],
                     {sender: contributor.address,
                      recipient: `${deployer.address}.ft-dao`,
                      amount: "100"
                     });
        block.receipts[2].result.expectOk().expectBool(true);
        // vote-proposal ERR-STAKEHOLDERS-ONLY
        block.receipts[3].result.expectErr().expectUint(104);
        block.receipts[4].result.expectOk().expectBool(true);
        // vote-proposal ERR-PROPOSAL-NOT-EXISTS
        block.receipts[5].result.expectErr().expectUint(106);
        block.receipts[6].result.expectOk().expectBool(true);
        // vote-proposal ERR-SAME-VALUE
        block.receipts[7].result.expectErr().expectUint(105);
        // is-proposal-succeeded ERR-VOTE-IN-PROGRESS
        block.receipts[8].result.expectErr().expectUint(108);
        // pay-to ERR-OWNER-ONLY
        block.receipts[9].result.expectErr().expectUint(100);
        block.receipts[10].result.expectOk().expectBool(true);
        
        // Expire voting period
        chain.mineEmptyBlockUntil(votingPeriod);

        const block1 = chain.mineBlock([
            // user can't get results of voting of proposal while vote still last
            Tx.contractCall ('ft-dao', 'is-proposal-succeeded',
                [types.uint(1)],
                user.address
            ),
        ]);

        block1.receipts[0].result.expectOk().expectBool(true);
    },
});
