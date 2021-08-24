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
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";

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

  const txOptions = {
    recipient: req.body.user.address,
    amount: 12345n,
    senderKey: privateKeyToString(privateKey),
    network,
    memo: "test memo",
    anchorMode: AnchorMode.Any,
  };

  try {
    const transaction = await makeSTXTokenTransfer(txOptions);

    // to see the raw serialized tx
    const serializedTx = transaction.serialize().toString("hex");
    console.log("serializedTx: " + serializedTx);

    // broadcasting transaction to the specified network
    const broadcastResponse = await broadcastTransaction(transaction, network);
    const txId = broadcastResponse.txid;
    console.log("txId: " + txId);
    res.send("STX Transfer Request Sent: " + txId);
  } catch (err) {
    res.send("Function Failed: " + err);
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
    console.log(result);
    res.send("Function Succeded: " + result.value.value);
  } catch (err) {
    console.log(err);
    res.send("Function failed with error: " + err); // TypeError: failed to fetch
  }
});

app.get(routes.goal_score, async (req, res) => {
  const txOptions = {
    contractAddress: constants.functions.contractAddress,
    contractName: constants.functions.contract.name,
    functionName: constants.functions.contract.public.goal_score.name,
    functionArgs: [constants.functions.contract.public.goal_score.principal],
    senderKey: privateKeyToString(privateKey),
    validateWithAbi: true,
    network,
    postConditions: [],
    anchorMode: AnchorMode.Any,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    const txId = broadcastResponse.txid;
    console.log("txID: " + txId);
    res.send("Function Succeded: " + "txId: " + txId);
  } catch (err) {
    console.log(err);
    res.send("Function Failed with error: " + err); // TypeError: failed to fetch
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
