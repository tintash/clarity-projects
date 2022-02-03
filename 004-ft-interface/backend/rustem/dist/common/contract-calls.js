"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteProposal = exports.createProposal = exports.mintFT = exports.setMnemonic = exports.isProposalSucceeded = exports.getProposal = exports.getTokenURI = exports.getTokenSupply = exports.getTokenDecimals = exports.getTokenSymbol = exports.getTokenName = void 0;
const transactions_1 = require("@stacks/transactions");
const bip39_1 = require("bip39");
const bip32_1 = require("bip32");
const blockstack_1 = __importDefault(require("blockstack"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const constants = __importStar(require("./constants"));
const use_network_1 = require("./hooks/use-network");
const sendtx_1 = require("./hooks/sendtx");
const network = (0, use_network_1.useNetwork)();
let mnemonic = "twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw";
async function makeReadOnlyCall(functionName, functionArgs = []) {
    const [contractAddress, contractName] = constants.DAO_FT_CONTRACT.split(".");
    const data = await (0, transactions_1.callReadOnlyFunction)({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        network,
        senderAddress: contractAddress,
    });
    return data;
}
async function getTokenName() {
    const data = await makeReadOnlyCall(constants.DAO_FT_NAME);
    return (0, transactions_1.cvToJSON)(data).value.value;
}
exports.getTokenName = getTokenName;
async function getTokenSymbol() {
    const data = await makeReadOnlyCall(constants.DAO_FT_SYMBOL);
    return (0, transactions_1.cvToJSON)(data).value.value;
}
exports.getTokenSymbol = getTokenSymbol;
async function getTokenDecimals() {
    const data = await makeReadOnlyCall(constants.DAO_FT_DECIMALS);
    return (0, transactions_1.cvToJSON)(data).value.value;
}
exports.getTokenDecimals = getTokenDecimals;
async function getTokenSupply() {
    const data = await makeReadOnlyCall(constants.DAO_FT_SUPPLY);
    return (0, transactions_1.cvToJSON)(data).value.value;
}
exports.getTokenSupply = getTokenSupply;
async function getTokenURI() {
    const data = await makeReadOnlyCall(constants.DAO_FT_URI);
    return (0, transactions_1.cvToJSON)(data).value.value.value;
}
exports.getTokenURI = getTokenURI;
async function getProposal(req) {
    // console.log(req.query);
    // console.log(req.body);
    const proposalId = (0, transactions_1.uintCV)(req.query.id);
    const data = await makeReadOnlyCall(constants.DAO_FT_GET_PROPOSAL, [proposalId]);
    console.log((0, transactions_1.cvToJSON)(data));
    return (0, transactions_1.cvToJSON)(data).value?.value?.value;
}
exports.getProposal = getProposal;
async function isProposalSucceeded(req) {
    const proposalId = (0, transactions_1.uintCV)(req.query.id);
    const data = await makeReadOnlyCall(constants.DAO_FT_IS_PROPOSAL_SUCCEEDED, [proposalId]);
    return (0, transactions_1.cvToJSON)(data).value.value.value;
}
exports.isProposalSucceeded = isProposalSucceeded;
function setMnemonic(secret) {
    mnemonic = secret;
    return mnemonic;
}
exports.setMnemonic = setMnemonic;
async function mintFT(req) {
    const amountFT = (0, transactions_1.uintCV)(req.query.amount);
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const master = (0, bip32_1.fromSeed)(seed);
    const child = master.derivePath("m/44'/5757'/0'/0/0");
    const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
    const privkey = blockstack_1.default.ecPairToHexString(ecPair);
    // const senderAddress = blockstack.ecPairToAddress(ecPair);
    const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
    const [contractAddress, contractName] = constants.DAO_FT_CONTRACT.split(".");
    const postConditionAddress = senderAddress;
    const postConditionCode = transactions_1.FungibleConditionCode.GreaterEqual;
    const postConditionAmount = 1000000n;
    const postConditions = [
        (0, transactions_1.makeStandardSTXPostCondition)(postConditionAddress, postConditionCode, postConditionAmount),
    ];
    const txOptions = {
        contractAddress,
        contractName,
        functionName: constants.DAO_FT_MINT,
        functionArgs: [amountFT],
        senderKey: privkey,
        validateWithAbi: true,
        network,
        postConditions,
        anchorMode: transactions_1.AnchorMode.Any,
    };
    // const transaction = await makeContractCall(txOptions);
    // const broadcastResponse = await broadcastTransaction(transaction, network);
    // return JSON.stringify(broadcastResponse);
    return (0, sendtx_1.sendTx)(txOptions);
}
exports.mintFT = mintFT;
async function createProposal(req) {
    const newProposalName = (0, transactions_1.stringAsciiCV)(req.query.name);
    const newProposalExpire = (0, transactions_1.uintCV)(req.query.expireAt);
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const master = (0, bip32_1.fromSeed)(seed);
    const child = master.derivePath("m/44'/5757'/0'/0/0");
    const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
    const privkey = blockstack_1.default.ecPairToHexString(ecPair);
    const [contractAddress, contractName] = constants.DAO_FT_CONTRACT.split(".");
    const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
    const postConditionAddress = senderAddress;
    const postConditionCode = transactions_1.FungibleConditionCode.GreaterEqual;
    const postConditionAmount = 1000000n;
    const postConditions = [
        (0, transactions_1.makeStandardSTXPostCondition)(postConditionAddress, postConditionCode, postConditionAmount),
    ];
    const txOptions = {
        contractAddress,
        contractName,
        functionName: constants.DAO_FT_CREATE_PROPOSAL,
        functionArgs: [newProposalName, newProposalExpire],
        senderKey: privkey,
        validateWithAbi: true,
        network,
        postConditions,
        anchorMode: transactions_1.AnchorMode.Any,
    };
    return (0, sendtx_1.sendTx)(txOptions);
}
exports.createProposal = createProposal;
async function voteProposal(req) {
    const proposalId = (0, transactions_1.uintCV)(req.query.id);
    const proposalVote = (0, transactions_1.uintCV)(req.query.vote) ? (0, transactions_1.trueCV)() : (0, transactions_1.falseCV)();
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const master = (0, bip32_1.fromSeed)(seed);
    const child = master.derivePath("m/44'/5757'/0'/0/0");
    const ecPair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
    const privkey = blockstack_1.default.ecPairToHexString(ecPair);
    const [contractAddress, contractName] = constants.DAO_FT_CONTRACT.split(".");
    const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
    const postConditionAddress = senderAddress;
    const postConditionCode = transactions_1.FungibleConditionCode.GreaterEqual;
    const postConditionAmount = 1000000n;
    const postConditions = [
        (0, transactions_1.makeStandardSTXPostCondition)(postConditionAddress, postConditionCode, postConditionAmount),
    ];
    const txOptions = {
        contractAddress,
        contractName,
        functionName: constants.DAO_FT_VOTE_PROPOSAL,
        functionArgs: [proposalId, proposalVote],
        senderKey: privkey,
        validateWithAbi: true,
        network,
        postConditions,
        anchorMode: transactions_1.AnchorMode.Any,
    };
    return (0, sendtx_1.sendTx)(txOptions);
}
exports.voteProposal = voteProposal;
