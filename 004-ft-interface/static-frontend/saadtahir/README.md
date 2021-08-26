## Overview

This is a static web page app that interacts with the Hiro Wallet to make transactions based on the Fungible Token contract in Assignment # 3. The app has very minimal page where user can Autheticate account using Authentication script and his Testnet and Mainnet addresses appear on the screen. The user data is saved in decentralized storage after authentication is successful and you can see logs in console. User can transferSTX to a hardcoded account. User can call goal-scored function and send Fungible Token to hard coded address.

## App.js

Starter script containing all the user interface with buttons

## Authentication.js

1. This uses @stacks/connect library to connect with the Hiro Wallet for authentication by pressing **Authenticate** button
2. This uses @stacks/storage library to store userData in decentralized storage. You can press **Retrieve Data** button to retrieve the saved data

## Contract.js

This uses @stacks/connect to call a smart contract and send tokens to a principal (e.g hardcoded for now) on pressing **Call Contract** button

## TransfarSTX.js

This transfers 100 stx to recepient (e.g hardcoded for now) on pressing **Transfer 100 stx** button.
