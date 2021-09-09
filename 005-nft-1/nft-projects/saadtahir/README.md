## Overview

Velocity-nft is a marketplace for people to buy cars containing special attributes. The common car name is velocity. People can buy, sell, trade velocity. The app uses React JS as front end and @stacks/connect to connect with the wallet for transaction handling and authentication. @stacks/storage will be used as database and each user data will be saved in their respective UUID.json. In order to get profit from each transaction, you need to collect commision on every transfer people make e.g 2.5%. Keep the limit of tokens to 1000 and give 1000 tokens for free to all the people who register.

## velocity.clar

Implements nft-trait **SIP009 NFT trait on mainnet**. There is a max token limit of 1000. No more tokens that this limit are minted/created by contract-owner. All these tokens are up to claim by any user for free.

1. **get-token-uri** generates a dynamic uri for each token-id.
2. **get-meta** and **get-nft-meta** returns a video link for that nft. (you can customise this as well to return a dynamic meta for each token)
3. **balance-of** returns the total number of nfts each principal has.
4. **claim** can be used by tx-sender to claim the velocity token for free.

## velocity-market.clar

This contract will be the market place where users can buy, sell, trade, information about the tokens, salable tokens list, recent bought token id and many other features that can be added will be used. This market place also handles the commision which the contract owner will get for each transfer.

## nft-trait.clar

SIP009 NFT trait

## string-conversion.clar

This is a uint-to-string conversion contract that can be used for making uri/meta/nft-meta dynamic for each token-id. (it can be added into velocity-market contract as well)
