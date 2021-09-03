import express from "express";
import constants from "./constants.js";
import routes from "./myroutes.js";
import {
  createStacksPrivateKey,
  getPublicKey,
  privateKeyToString,
  publicKeyToString,
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  callReadOnlyFunction,
  makeContractCall,
  standardPrincipalCV,
  uintCV,
  PostConditionMode,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import { BN } from "bn.js";

const app = express();
const port = constants.port;

// Wallet information
const privateKey = createStacksPrivateKey(
  constants.keychain.keyInfo.privateKey
);
const publicKey = getPublicKey(privateKey);
const network = new StacksTestnet();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get(routes.hello, (req, res) => {
  res.send("Hello World!");
});

app.get(routes.user, (req, res) => {
  res.send("Saad Tahir");
});

app.get(routes.privateKey, (req, res) => {
  const str = privateKeyToString(privateKey);
  res.send(str);
});

app.get(routes.publicKey, (req, res) => {
  const str = publicKeyToString(publicKey);
  res.send(str);
});

app.post(routes.stx_send, async (req, res) => {
  console.log(req.body);

  const recipient = req.body.recipient;
  const amount = req.body.amount;
  const memo = req.body.memo;

  const txOptions = {
    recipient,
    amount: new BN(amount),
    senderKey: privateKeyToString(privateKey),
    network,
    memo: memo,
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
  };

  try {
    const transaction = await makeSTXTokenTransfer(txOptions);
    const serializedTx = transaction.serialize().toString("hex");
    const txId = transaction.txid();
    broadcastTransaction(transaction, network);

    console.log("serializedTx: " + serializedTx);
    console.log("txId: " + txId);
    res.send("STX Token Transfer call sent: " + txId);
  } catch (error) {
    console.log("ERROR: " + error);
    res.send("Function Failed with error: " + err); // TypeError: failed to fetch
  }
});

app.get(routes.random, async (req, res) => {
  const options = {
    contractAddress: constants.functions.contractAddress,
    contractName: constants.functions.contract.name,
    functionName: constants.functions.contract.read_only.get_random_number.name,
    functionArgs: [],
    network,
    senderAddress: constants.functions.senderAddress,
  };

  try {
    const result = await callReadOnlyFunction(options);
    console.log(result.value.value);
    res.send("Function Succeded: " + result.value.value);
  } catch (err) {
    console.log(err);
    res.send("Function failed with error: " + err); // TypeError: failed to fetch
  }
});

app.post(routes.is_goal_scored, async (req, res) => {
  console.log(req.body);

  const player = standardPrincipalCV(req.body.player);
  const score = uintCV(req.body.score);
  console.log("Player: " + player.address);
  console.log("Score: " + score);

  const txOptions = {
    contractAddress: constants.functions.contractAddress,
    contractName: constants.functions.contract.name,
    functionName: constants.functions.contract.public.is_goal_scored.name,
    functionArgs: [score, player],
    senderKey: privateKeyToString(privateKey),
    validateWithAbi: true,
    network,
    postConditions: [],
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const serializedTx = transaction.serialize().toString("hex");
    const txId = transaction.txid();
    broadcastTransaction(transaction, network);

    console.log("serializedTx: " + serializedTx);
    console.log("txId: " + txId);
    res.send("Function Succeded: " + "txId: " + txId);
  } catch (err) {
    console.log(err);
    res.send("Function Failed with error: " + err); // TypeError: failed to fetch
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
