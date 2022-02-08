import {
  callReadOnlyFunction,
  AnchorMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  cvToJSON,
  stringAsciiCV,
  trueCV,
  falseCV,
  uintCV,
} from "@stacks/transactions";

import { mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32"
import blockstack from "blockstack";
import * as bitcoin from "bitcoinjs-lib";

import * as constants from "./constants";
import { useNetwork } from "./hooks/use-network"
import { sendTx } from "./hooks/sendtx"

const network = useNetwork();
let mnemonic =
  "twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw";

async function makeReadOnlyCall(functionName, functionArgs=[]) {
  const [contractAddress, contractName] =
    constants.DAO_FT_CONTRACT.split(".");
  const data = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    network,
    senderAddress: contractAddress,
  });
  return data;
}

export async function getTokenName() {
  const data = await makeReadOnlyCall(constants.DAO_FT_NAME);
  return cvToJSON(data).value.value;
}

export async function getTokenSymbol() {
  const data = await makeReadOnlyCall(constants.DAO_FT_SYMBOL);
  return cvToJSON(data).value.value;
}

export async function getTokenDecimals() {
  const data = await makeReadOnlyCall(constants.DAO_FT_DECIMALS);
  return cvToJSON(data).value.value;
}

export async function getTokenSupply() {
  const data = await makeReadOnlyCall(constants.DAO_FT_SUPPLY);
  return cvToJSON(data).value.value;
}

export async function getTokenURI() {
  const data = await makeReadOnlyCall(constants.DAO_FT_URI);
  return cvToJSON(data).value.value.value;
}

export async function getProposal(req) {
  // console.log(req.query);
  // console.log(req.body);
  const proposalId = uintCV(req.query.id);
  const data = await makeReadOnlyCall(constants.DAO_FT_GET_PROPOSAL, [proposalId]);
  console.log(cvToJSON(data));
  return cvToJSON(data).value?.value?.value;
}

export async function isProposalSucceeded(req) {
  const proposalId = uintCV(req.query.id);
  const data = await makeReadOnlyCall(constants.DAO_FT_IS_PROPOSAL_SUCCEEDED,
                                      [proposalId]);
  return cvToJSON(data).value.value.value;
}

export function setMnemonic(secret) {
  mnemonic = secret;
  return mnemonic;
}

export async function mintFT(req) {
  const amountFT = uintCV(req.body.amount);

  // generating privatkey from mnemonic
  const seed = mnemonicToSeedSync(mnemonic);
  const master = fromSeed(seed);
  const child = master.derivePath("m/44'/5757'/0'/0/0");
  const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
  const privkey = blockstack.ecPairToHexString(ecPair);
  // const senderAddress = blockstack.ecPairToAddress(ecPair);
  
  // generating transactions post Conditions
  const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
  const postConditionAddress = senderAddress;
  const postConditionCode = FungibleConditionCode.GreaterEqual;
  const postConditionAmount = 1000000n;
  const postConditions = [
    makeStandardSTXPostCondition(postConditionAddress, postConditionCode, postConditionAmount),
  ];
  
  // Preparing transactions options
  const [contractAddress, contractName] =
  constants.DAO_FT_CONTRACT.split(".");

  const txOptions = {
    contractAddress,
    contractName,
    functionName: constants.DAO_FT_MINT,
    functionArgs: [amountFT],
    senderKey: privkey,
    validateWithAbi: true,
    network,
    postConditions,
    anchorMode: AnchorMode.Any,
  };

  return sendTx(txOptions);
}

export async function createProposal(req) {
  const newProposalName = stringAsciiCV(req.body.name);
  const newProposalExpire = uintCV(req.body.expireAt);

  // generating privatkey from mnemonic
  const seed = mnemonicToSeedSync(mnemonic);
  const master = fromSeed(seed);
  const child = master.derivePath("m/44'/5757'/0'/0/0");
  const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
  const privkey = blockstack.ecPairToHexString(ecPair);

  // generating transactions post Conditions
  const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
  const postConditionAddress = senderAddress;
  const postConditionCode = FungibleConditionCode.GreaterEqual;
  const postConditionAmount = 1000000n;
  const postConditions = [
    makeStandardSTXPostCondition(postConditionAddress, postConditionCode, postConditionAmount),
  ];
  
  // Preparing transactions options
  const [contractAddress, contractName] =
  constants.DAO_FT_CONTRACT.split(".");

  const txOptions = {
    contractAddress,
    contractName,
    functionName: constants.DAO_FT_CREATE_PROPOSAL,
    functionArgs: [newProposalName, newProposalExpire],
    senderKey: privkey,
    validateWithAbi: true,
    network,
    postConditions,
    anchorMode: AnchorMode.Any,
  };
  return sendTx(txOptions);
}

export async function voteProposal(req) {
  const proposalId = uintCV(req.body.id);
  const proposalVote = uintCV(req.body.vote) ? trueCV() : falseCV();

  // generating privatkey from mnemonic
  const seed = mnemonicToSeedSync(mnemonic);
  const master = fromSeed(seed);
  const child = master.derivePath("m/44'/5757'/0'/0/0");
  const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
  const privkey = blockstack.ecPairToHexString(ecPair);
  
  // generating transactions post Conditions
  const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
  const postConditionAddress = senderAddress;
  const postConditionCode = FungibleConditionCode.GreaterEqual;
  const postConditionAmount = 1000000n;
  const postConditions = [
    makeStandardSTXPostCondition(postConditionAddress, postConditionCode, postConditionAmount),
  ];
  
  // Preparing transactions options
  const [contractAddress, contractName] =
  constants.DAO_FT_CONTRACT.split(".");
  
  const txOptions = {
    contractAddress,
    contractName,
    functionName: constants.DAO_FT_VOTE_PROPOSAL,
    functionArgs: [proposalId, proposalVote],
    senderKey: privkey,
    validateWithAbi: true,
    network,
    postConditions,
    anchorMode: AnchorMode.Any,
  };

  return sendTx(txOptions);
}
