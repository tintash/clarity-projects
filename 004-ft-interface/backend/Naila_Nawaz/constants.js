import express from 'express'
import { StacksTestnet } from '@stacks/network';
import {createStacksPrivateKey} from '@stacks/transactions'
import path from 'path';

// express js setup
export const app = express();

export const port = process.env.PORT || "8000";
// testnet setup
export const network = new StacksTestnet();
export const privateKey = createStacksPrivateKey(
    ""); // add your private key here to test the server

//contract details
export const contractAddress = "ST1H4SF8Z6KA2KZGD2W3VAJH6STG4XDAK4KD36WBB";
export const contractName = "game_contract";
export const senderAddress = "ST2A1S52EP2J6GZ2DTBA8WKEDCY8V4PVB6JX5SHSD";
// function names
export const randomNumberFunction = "get-random-number";
export const tokenUriFunction = "get-token-uri";
export const registerUserFunction = "register-user";
export const playGameFunction = "play-game";
export const getNameFunction = "get-name";
export const getBalanceFunction = "get-balance-of";
export const __dirname = path.resolve(path.dirname(''));