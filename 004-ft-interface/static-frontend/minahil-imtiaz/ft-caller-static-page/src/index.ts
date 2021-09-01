import {
  AppConfig,
  UserSession,
  showConnect,
  ContractCallOptions,
  openContractCall,
  UserData,
} from "@stacks/connect";
import {
  uintCV,
  ReadOnlyFunctionOptions,
  callReadOnlyFunction,
  cvToJSON,
  FungibleConditionCode,
  ClarityValue,
  standardPrincipalCV,
  PostConditionMode,
  stringAsciiCV,
  createAssetInfo,
  makeStandardFungiblePostCondition,
  makeContractSTXPostCondition,
  contractPrincipalCV,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import BN from "bn.js";
import { FungiblePostCondition } from "@stacks/transactions/dist/transactions/src/postcondition";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
let userData: UserData;
let userAddress = "";
const network = new StacksTestnet();
const deployerAddress = "ST3F9BYX07T0Q51JT2YVXT532BNZGY78KT7ZMH6KC";
const tokenContractName = "cosmo-ft";
const storeContractName = "product-store";
const assetName = "cosmo-ft";
const explorerBaseUrl = "https://explorer.stacks.co/txid/0x";
const conversionRate = 1000;
const appDetails = {
  name: "Product Store",
  icon: window.location.origin + "/src/icon.jpg",
};

function createReadOnlyFunctionOption(
  functionName: string,
  contractName: string,
  functionArgs: ClarityValue[] = [],
  senderAddress: string = deployerAddress
): ReadOnlyFunctionOptions {
  const options: ReadOnlyFunctionOptions = {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    network,
    senderAddress: senderAddress,
  };
  return options;
}

function createContractCallOptions(
  contractName: string,
  functionName: string,
  outputElementId: string,
  functionArguments: ClarityValue[] = []
): ContractCallOptions {
  return {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArguments,
    appDetails,
    userSession: userSession,
    onFinish: (data) => {
      document.getElementById(outputElementId)!.innerHTML =
        explorerBaseUrl + data.txId.toString();
    },
    onCancel: () => {
      alert("You cancelled the request");
    },
  };
}

function createFungibleAssetPostCondition(
  senderAddress: string,
  amount: string,
  conditionCode: FungibleConditionCode
): FungiblePostCondition {
  const postConditionAddress = senderAddress;
  const postConditionCode = conditionCode;
  const postConditionAmount: BN = new BN(amount);
  const fungibleAssetInfo = createAssetInfo(
    deployerAddress,
    tokenContractName,
    assetName
  );

  const fungiblePostCondition: FungiblePostCondition =
    makeStandardFungiblePostCondition(
      postConditionAddress,
      postConditionCode,
      postConditionAmount,
      fungibleAssetInfo
    );

  return fungiblePostCondition;
}

async function getTokenName() {
  try {
    const options = createReadOnlyFunctionOption("get-name", tokenContractName);
    const result = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    return jsonResponse.value.value;
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function getTokenSymbol() {
  try {
    const options = createReadOnlyFunctionOption(
      "get-symbol",
      tokenContractName
    );
    const result = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    return jsonResponse.value.value;
  } catch (error) {
    return "";
  }
}

async function getTokenSupply() {
  try {
    const options = createReadOnlyFunctionOption(
      "get-total-supply",
      tokenContractName
    );
    const result = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    return jsonResponse.value.value;
  } catch (error) {
    return "";
  }
}

async function getBalance(e: Event) {
  e.preventDefault();
  try {
    const options = createReadOnlyFunctionOption(
      "get-balance-of",
      tokenContractName,
      [standardPrincipalCV(userAddress.toString())]
    );
    const result = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    document.getElementById("balance-output")!.innerHTML =
      jsonResponse.value.value;
  } catch (error) {
    document.getElementById("balance-output")!.innerHTML =
      JSON.stringify(error);
  }
}

async function getTokens(e: Event) {
  e.preventDefault();
  const amount = (<HTMLInputElement>(
    document.getElementById("token-issue-amount")
  )).value;
  const recipientAddress = (<HTMLInputElement>(
    document.getElementById("token-receiver-address")
  )).value;
  const opts: ContractCallOptions = createContractCallOptions(
    tokenContractName,
    "issue-token",
    "issue-token-output",
    [uintCV(amount), standardPrincipalCV(recipientAddress)]
  );
  await openContractCall(opts);
}

async function transferTokens(e: Event) {
  e.preventDefault();
  const amount = (<HTMLInputElement>document.getElementById("transfer-amount"))
    .value;
  const recipientAddress = (<HTMLInputElement>(
    document.getElementById("token-recipient-address")
  )).value;

  const fungibleAssetPostCondition = createFungibleAssetPostCondition(
    userAddress,
    amount,
    FungibleConditionCode.Equal
  );

  const callArguments: ClarityValue[] = [
    uintCV(amount),
    standardPrincipalCV(userAddress),
    standardPrincipalCV(recipientAddress),
  ];

  const opts: ContractCallOptions = createContractCallOptions(
    tokenContractName,
    "transfer",
    "transfer-token-output",
    callArguments
  );
  opts.postConditions = [fungibleAssetPostCondition];
  await openContractCall(opts);
}

async function burnTokens(e: Event) {
  e.preventDefault();
  const amount = (<HTMLInputElement>document.getElementById("burn-amount"))
    .value;
  const ownerAddress = (<HTMLInputElement>(
    document.getElementById("owner-stx-address")
  )).value;

  const fungibleAssetPostCondition = createFungibleAssetPostCondition(
    ownerAddress,
    amount,
    FungibleConditionCode.Equal
  );

  const opts: ContractCallOptions = createContractCallOptions(
    tokenContractName,
    "destroy-token",
    "destroy-token-output",
    [uintCV(amount), standardPrincipalCV(ownerAddress)]
  );
  opts.postConditions = [fungibleAssetPostCondition];
  await openContractCall(opts);
}

async function addValidContractCaller(e: Event) {
  e.preventDefault();
  const callerDeployerAddress = (<HTMLInputElement>(
    document.getElementById("deployer-address")
  )).value;
  const callerContractName = (<HTMLInputElement>(
    document.getElementById("contract-name")
  )).value;

  const opts: ContractCallOptions = createContractCallOptions(
    tokenContractName,
    "add-valid-contract-caller",
    "contract-caller-output",
    [contractPrincipalCV(callerDeployerAddress, callerContractName)]
  );
  await openContractCall(opts);
}

async function getProductPrice(e: Event) {
  e.preventDefault();
  try {
    const productName = (<HTMLInputElement>(
      document.getElementById("product-name")
    )).value;
    const options: ReadOnlyFunctionOptions = createReadOnlyFunctionOption(
      "get-product-price",
      storeContractName,
      [stringAsciiCV(productName)],
      userAddress
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    document.getElementById("price-output")!.innerHTML =
      JSON.stringify(jsonResponse);
  } catch (error) {
    document.getElementById("price-output")!.innerHTML = JSON.stringify(error);
  }
}

async function getBonusPointsCount(e: Event) {
  e.preventDefault();
  try {
    const options: ReadOnlyFunctionOptions = createReadOnlyFunctionOption(
      "get-bonus-points-count",
      storeContractName,
      [],
      userAddress
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    document.getElementById("bonus-point-output")!.innerHTML +=
      jsonResponse.value.value;
  } catch (error) {
    document.getElementById("bonus-point-output")!.innerHTML +=
      JSON.stringify(error);
  }
}

async function addProduct(e: Event) {
  e.preventDefault();

  const price = (<HTMLInputElement>document.getElementById("price")).value;
  const productName = (<HTMLInputElement>(
    document.getElementById("new-product-name")
  )).value;
  const quantity = (<HTMLInputElement>document.getElementById("quantity"))
    .value;
  const callArguments: ClarityValue[] = [
    stringAsciiCV(productName),
    uintCV(price),
    uintCV(quantity),
  ];

  const opts: ContractCallOptions = createContractCallOptions(
    storeContractName,
    "add-product",
    "add-product-output",
    callArguments
  );
  await openContractCall(opts);
}

async function deleteProduct(e: Event) {
  e.preventDefault();
  const productName = (<HTMLInputElement>(
    document.getElementById("delete-product-name")
  )).value;
  const callArguments: ClarityValue[] = [stringAsciiCV(productName)];

  const opts: ContractCallOptions = createContractCallOptions(
    storeContractName,
    "delete-product",
    "delete-product-output",
    callArguments
  );
  await openContractCall(opts);
}

async function buyProduct(e: Event) {
  e.preventDefault();
  const productName = (<HTMLInputElement>(
    document.getElementById("requested-product-name")
  )).value;
  const opts: ContractCallOptions = createContractCallOptions(
    storeContractName,
    "buy-product",
    "purchase-output",
    [stringAsciiCV(productName)]
  );
  opts.postConditionMode = PostConditionMode.Allow;
  await openContractCall(opts);
}

async function transferReward(e: Event) {
  e.preventDefault();
  const transferAmount = (<HTMLInputElement>(
    document.getElementById("reward-transfer-amount")
  )).value;

  const fungibleAssetPostCondition = createFungibleAssetPostCondition(
    userAddress,
    transferAmount,
    FungibleConditionCode.Equal
  );

  const opts: ContractCallOptions = createContractCallOptions(
    storeContractName,
    "transfer-reward-tokens",
    "transfer-reward-output",
    [uintCV(transferAmount), standardPrincipalCV(deployerAddress)]
  );
  opts.postConditions = [fungibleAssetPostCondition];
  await openContractCall(opts);
}

async function redeemReward(e: Event) {
  e.preventDefault();
  const rewardAmount = (<HTMLInputElement>(
    document.getElementById("redeem-amount")
  )).value;

  const STXPostConditionCode = FungibleConditionCode.Equal;
  const STXPostConditionAmount = new BN(Number(rewardAmount) / conversionRate);
  const contractSTXPostCondition = makeContractSTXPostCondition(
    deployerAddress,
    storeContractName,
    STXPostConditionCode,
    STXPostConditionAmount
  );

  const fungibleAssetPostCondition = createFungibleAssetPostCondition(
    userAddress,
    rewardAmount,
    FungibleConditionCode.Equal
  );
  const txOptions: ContractCallOptions = createContractCallOptions(
    storeContractName,
    "redeem-reward-tokens",
    "redeem-reward-output",
    [uintCV(rewardAmount)]
  );
  txOptions.postConditions = [
    fungibleAssetPostCondition,
    contractSTXPostCondition,
  ];
  await openContractCall(txOptions);
}

async function showPopup() {
  showConnect({
    appDetails,
    redirectTo: "/",
    onFinish: () => {
      userData = userSession.loadUserData();
      userAddress = userData.profile.stxAddress.testnet;
      // Save or otherwise utilize userData post-authentication
    },
    userSession: userSession,
  });
}

async function setTokenInformation() {
  const tokenName = await getTokenName();
  const tokenSymbol = await getTokenSymbol();
  const tokenSupply = await getTokenSupply();

  document.getElementById("token-name")!.innerHTML += tokenName;
  document.getElementById("token-symbol")!.innerHTML += tokenSymbol;
  document.getElementById("total-supply")!.innerHTML += tokenSupply;
}

function setEventListeners() {
  document
    .getElementById("balance-inquiry-form")!
    .addEventListener("submit", getBalance);

  document
    .getElementById("issue-tokens")!
    .addEventListener("submit", getTokens);

  document
    .getElementById("destroy-tokens")!
    .addEventListener("submit", burnTokens);

  document
    .getElementById("transfer-tokens")!
    .addEventListener("submit", transferTokens);

  document
    .getElementById("add-valid-contract-caller")!
    .addEventListener("submit", addValidContractCaller);

  document
    .getElementById("get-product-price")!
    .addEventListener("submit", getProductPrice);

  document
    .getElementById("get-bonus-points-count")!
    .addEventListener("submit", getBonusPointsCount);

  document
    .getElementById("buy-product")!
    .addEventListener("submit", buyProduct);

  document
    .getElementById("transfer-reward-tokens")!
    .addEventListener("submit", transferReward);

  document
    .getElementById("redeem-reward-tokens")!
    .addEventListener("submit", redeemReward);

  document
    .getElementById("add-product")!
    .addEventListener("submit", addProduct);

  document
    .getElementById("delete-product")!
    .addEventListener("submit", deleteProduct);
}

async function load() {
  await showPopup();
  setTokenInformation();
  setEventListeners();
}

window.onload = load;
