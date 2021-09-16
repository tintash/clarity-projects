
// @ts-ignore
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
// @ts-ignore
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "refer-reward-ft -- only contract owner can authorize/de-authorize contract calling principals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let eContractPrincipal = accounts.get('wallet_1')!;
        let eUnknown = accounts.get('wallet_1')!;
        let block = chain.mineBlock([
            // deployer adds contract principal to valid list 
            Tx.contractCall ('refer-reward-ft', 'add-caller', 
                [types.principal(`${eContractPrincipal.address}.escrow-app`)],
                deployer.address
            ),
            // deployer removes contract principal from valid list 
            Tx.contractCall ('refer-reward-ft', 'remove-caller', 
                [types.principal(`${eContractPrincipal.address}.escrow-app`)],
                deployer.address
            ),
            // eUnknown tries to add contract principal to valid list
            Tx.contractCall ('refer-reward-ft', 'add-caller', 
                [types.principal(`${deployer.address}.escrow-app`)],
                eUnknown.address
            ),
            // eUnknown tries to add contract principal to valid list
            Tx.contractCall ('refer-reward-ft', 'remove-caller', 
                [types.principal(`${deployer.address}.escrow-app`)],
                eUnknown.address
            ),
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectErr().expectUint(100);
        block.receipts[3].result.expectErr().expectUint(100);
    },
});

Clarinet.test({
    name: "refer-reward-ft -- only authorized contract principals can mint / burn / transfer tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let eCaller = accounts.get('deployer')!;
        let eWallet1 = accounts.get('wallet_1')!;
        const tokens = 10;
        let block = chain.mineBlock([
            Tx.contractCall ('refer-reward-ft', 'create-ft', 
                [types.uint(tokens), types.principal(eCaller.address)],
                eCaller.address
            ),
            Tx.contractCall ('refer-reward-ft', 'destroy-ft', 
                [types.uint(tokens), types.principal(eCaller.address)],
                eCaller.address
            ),
            Tx.contractCall ('refer-reward-ft', 'transfer', 
                [types.uint(tokens), types.principal(eCaller.address), types.principal(eWallet1.address)],
                eCaller.address
            ),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(99);
        block.receipts[0].result.expectErr().expectUint(99);
        block.receipts[0].result.expectErr().expectUint(99);
    },
});

Clarinet.test({
    name: "refer-reward-ft -- verify miscellaneous ft traits",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const eCaller = accounts.get("deployer")!;
        // verify name
        let name = chain.callReadOnlyFn('refer-reward-ft', 'get-name',
        [], eCaller.address);
        name.result.expectOk().expectAscii('Refer rewards');
        // verify symbol
        let symbol = chain.callReadOnlyFn('refer-reward-ft', 'get-symbol',
        [], eCaller.address);
        symbol.result.expectOk().expectAscii('RR');
        // verify decimals
        let decimals = chain.callReadOnlyFn('refer-reward-ft', 'get-decimals',
        [], eCaller.address);
        decimals.result.expectOk().expectUint(2);
        // verify uri
        let uri = chain.callReadOnlyFn('refer-reward-ft', 'get-token-uri',
        [], eCaller.address);
        uri.result.expectOk().expectSome().expectUtf8("https://www.tintash.com/");
        // verify balance
        let balance = chain.callReadOnlyFn('refer-reward-ft', 'get-balance-of',
        [types.principal(eCaller.address)], eCaller.address);
        balance.result.expectOk().expectUint(0);
        // verify balance
        let totalSupply = chain.callReadOnlyFn('refer-reward-ft', 'get-total-supply',
        [], eCaller.address);
        totalSupply.result.expectOk().expectUint(0);
    },
});