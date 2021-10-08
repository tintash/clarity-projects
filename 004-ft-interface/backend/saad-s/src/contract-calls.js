const {
  callReadOnlyFunction,
  makeContractCall,
  cvToJSON,
  stringAsciiCV,
  standardPrincipalCV,
  broadcastTransaction,
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");

const { mnemonicToSeedSync } = require("bip39");
const { fromSeed } = require("bip32");
const blockstack = require("blockstack");
const bitcoin = require("bitcoinjs-lib");

const network = new StacksTestnet();
var mnemonic =
  "inside claim kick easily assist trim cat silk culture pumpkin drastic claim tail bleak journey lunar nose apple result draw fiscal present unlock evil";

const {
  REFER_REWARD_CONTRACT,
  RR_TOKEN_NAME,
  RR_TOKEN_SYMBOL,
  RR_TOKEN_DECIMALS,
  RR_TOKEN_SUPPLY,
  RR_TOKEN_URI,
  RR_REFER_USER,
  RR_PERFORM_TRANSACTION,
} = require("./constants");

async function getTokenName() {
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const data = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_TOKEN_NAME,
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  });
  return cvToJSON(data).value.value;
}

async function getTokenSymbol() {
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const data = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_TOKEN_SYMBOL,
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  });
  return cvToJSON(data).value.value;
}

async function getTokenDecimals() {
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const data = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_TOKEN_DECIMALS,
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  });
  return cvToJSON(data).value.value;
}

async function getTokenSupply() {
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const data = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_TOKEN_SUPPLY,
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  });
  return cvToJSON(data).value.value;
}

async function getTokenURI() {
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const data = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_TOKEN_URI,
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  });
  return cvToJSON(data).value.value.value;
}

function setMnemonic(secret) {
  mnemonic = secret;
  return mnemonic;
}

async function referUser(req) {
  const newUserAddress = standardPrincipalCV(req.query.useraddress);
  const newUserEmail = stringAsciiCV(req.query.useremail);

  const seed = mnemonicToSeedSync(mnemonic);
  const master = fromSeed(seed);
  const child = master.derivePath("m/44'/5757'/0'/0/0");
  const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
  const privkey = blockstack.ecPairToHexString(ecPair);

  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const transaction = await makeContractCall({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_REFER_USER,
    functionArgs: [newUserEmail, newUserAddress],
    senderKey: privkey,
    validateWithAbi: true,
    network,
  });

  const result = await broadcastTransaction(transaction, network);
  return JSON.stringify(result);
}

async function completeTransaction() {
  const seed = mnemonicToSeedSync(mnemonic);
  const master = fromSeed(seed);
  const child = master.derivePath("m/44'/5757'/0'/0/0");
  const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
  const privkey = blockstack.ecPairToHexString(ecPair);

  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const transaction = await makeContractCall({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: RR_PERFORM_TRANSACTION,
    functionArgs: [],
    senderKey: privkey,
    validateWithAbi: true,
    network,
  });

  const result = await broadcastTransaction(transaction, network);
  return JSON.stringify(result);
}

module.exports = {
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  getTokenSupply,
  getTokenURI,
  setMnemonic,
  referUser,
  completeTransaction,
};
