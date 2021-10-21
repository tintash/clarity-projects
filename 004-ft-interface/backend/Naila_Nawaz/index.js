import {privateKeyToString,AnchorMode, callReadOnlyFunction, makeContractCall, standardPrincipalCV,broadcastTransaction, codeBodyString} from '@stacks/transactions'
import bodyParser from 'body-parser';
import express from 'express'

import * as Constants from './constants.js'

Constants.app.use(bodyParser.urlencoded({extended: false}));
Constants.app.use(express.static('public'));

// this function will redirect to index.html file where all buttons are available
Constants.app.get("/", (req, res) => {
    res.sendFile('/index.html', { root : Constants.__dirname});
  });

// this function will register the caller
Constants.app.post ("/register", async(req, res) => {
  try {
    const tx = await contractCall (registerUserFunction, [standardPrincipalCV(req.body.regAddress)]);
    res.send("Registeration Successfull:" + tx);
  } catch (err) {
    console.log("Error: " +err);
  }
})

// this function will play the game for caller
Constants.app.post ("/play", async(req, res) => {
  try {
    const tx = await contractCall(playGameFunction,[]);
    res.send("Transaction Successfull:"  + tx);
  } catch (err) {
    console.log("Error: " +err);
  }
})

// read only functions
// this function will get the balance of address that is passed as param
Constants.app.get("/get-balance-of/:address", async(req,res) => {
  var addr = req.param('address');
  try {
    const result = await readOnlyCall(getBalanceFunction, [standardPrincipalCV(addr)]);
    res.send("Response " + result.value.value);
  } catch (err) {
    res.send("Error:" + err); 
  }   
})

Constants.app.get("/token-uri", async(req,res) => {
  try {
    const result = await readOnlyCall (tokenUriFunction, []);
    res.send("Response:" + result.value.value.data);
  } catch (err) {
    res.send ("error: " + err);
  }
})

Constants.app.get("/get-name", async(req,res) => {
  try {
    const result = await readOnlyCall (getNameFunction, []);
    res.send("Response:" + result.value.data);
  } catch (err) {
    res.send ("error: " + err);
  }
})

Constants.app.get("/random-number", async(req,res) => {
  try {
    // i need to add advance chaintip > 1 here, else it will generate a fixed number eerytime
    const result = await readOnlyCall (randomNumberFunction, []);
    res.send("Response:" + result.value.value);
  } catch (err) {
    res.send ("error: " + err);
  }
})

async function contractCall(functionName, functionArgs){
  const options = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    senderKey: privateKeyToString(privateKey),
    validateWithAbi: true,
    network,
    anchorMode:AnchorMode.Any,
  };
  const transaction = await makeContractCall(options);
  // console.log(transaction);
  const txId = await broadcastTransaction(transaction, network);
  return txId;
}

async function readOnlyCall(functionName, functionArgs){
  const options = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    network,
    senderAddress: senderAddress,
  }
  const result = await callReadOnlyFunction(options);
  return result;
}

// this function will redirect the server to local host:3000
Constants.app.listen(Constants.port, () => {
  console.log(`Listening to requests on http://localhost:${Constants.port}`);
});