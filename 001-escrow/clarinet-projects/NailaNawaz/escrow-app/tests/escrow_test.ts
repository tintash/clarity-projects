import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.10.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// test to check purchsae item method
Clarinet.test({
    name: "Buyer makes the purchase by sending amount to contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get("deployer")!;
      const buyer = accounts.get("wallet_1")!;
      const amount = 20;
  
      let block = chain.mineBlock([
        Tx.contractCall(
          "escrow",
          "purchaseItem",
          [types.uint(amount)],
          buyer.address
        ),
      ]);
      assertEquals(block.receipts.length, 1); // response array should have some value
      block.receipts[0].result.expectOk().expectBool(true); //response should be ok (true)
      block.receipts[0].events.expectSTXTransferEvent( //stx transfer event should be made
        amount,
        buyer.address,
        `${deployer.address}.escrow`
      );
      assertEquals(block.height, 2);
    },
  });

// test to check seller amount  method
Clarinet.test({
  name: "Seller makes the transaction by sending amount to contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    console.log("deployer");
    console.log(deployer);
    const buyer = accounts.get("wallet_2")!;
    const amount = 20;

    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "amountBySeller",
        [types.uint(amount)],
        buyer.address
      ),
    ]);
    assertEquals(block.receipts.length, 1); // response array should have some value
    block.receipts[0].result.expectOk().expectBool(true); //response should be ok (true)
    block.receipts[0].events.expectSTXTransferEvent( //stx transfer event should be made
      amount,
      buyer.address,
      `${deployer.address}.escrow`
    );
    assertEquals(block.height, 2);
  },
});


//  test to check item received  method
// Clarinet.test({
//   name: "Seller makes the transaction by sending amount to contract",
//   async fn(chain: Chain, accounts: Map<string, Account>) {
//     const deployer = accounts.get("deployer")!;
//     // const amount = 20;

//     let block = chain.mineBlock([
//       Tx.contractCall(
//         "escrow",
//         "itemReceived",
//         [],
//         deployer.address
//       ),
//     ]);
//     assertEquals(block.receipts.length, 1); // response array should have some value
//     block.receipts[0].result.expectOk().expectBool(true); //response should be ok (true)
    
//     assertEquals(block.height, 2);
//   },
// });
