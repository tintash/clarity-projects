## Assignment: 3 Fungible Tokens

I used the approach of app-data contract where app contract can call data contract functions and no other user can interact with data contract functions. app.clar is my app contract and my-ft.clar is a data contract that is implementing the ft-trait.sip-010-trait.

## app.clar

The method called goal-scored is called by contract-owner to mint tokens to the scorer. This contract calls methods of my-ft contract

## my-ft.clar

It implements ft-trait and only app contract can call it. give method is private because goal-scored calls it to mint tokens. destory and transfer method can be called by contract-owner or token-owner.

## ft-trait.clar

It contains a trait for fungible tokens.
