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
  makeContractSTXPostCondition,
} from "@stacks/transactions";
import BN from "bn.js";
import {
  appDetails,
  createContractCallOptions,
  createFungibleAssetPostCondition,
  createReadOnlyFunctionOption,
  deployerAddress,
  getTokenName,
  getTokenSupply,
  getTokenSymbol,
  getUserBalance,
  storeContractName,
  tokenContractName,
} from "./commonFunctions";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
const conversionRate = 1000;
let userData: UserData;
let userAddress = "";

async function getBalance(e: Event) {
  e.preventDefault();
  try {
    const result = await getUserBalance(userAddress.toString());
    const jsonResponse = cvToJSON(result);
    document.getElementById("balance-output")!.innerHTML =
      jsonResponse.value.value;
  } catch (error) {
    document.getElementById("balance-output")!.innerHTML =
      JSON.stringify(error);
  }
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
    userSession,
    callArguments
  );
  opts.postConditions = [fungibleAssetPostCondition];
  await openContractCall(opts);
}

async function burnTokens(e: Event) {
  e.preventDefault();
  const amount = (<HTMLInputElement>document.getElementById("burn-amount"))
    .value;

  const fungibleAssetPostCondition = createFungibleAssetPostCondition(
    userAddress,
    amount,
    FungibleConditionCode.Equal
  );

  const opts: ContractCallOptions = createContractCallOptions(
    tokenContractName,
    "destroy-token",
    "destroy-token-output",
    userSession,
    [uintCV(amount), standardPrincipalCV(userAddress)]
  );
  opts.postConditions = [fungibleAssetPostCondition];
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
    document.getElementById("bonus-point-output")!.innerHTML =
      jsonResponse.value.value;
  } catch (error) {
    document.getElementById("bonus-point-output")!.innerHTML =
      JSON.stringify(error);
  }
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
    userSession,
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
    userSession,
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
    userSession,
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
    appDetails: appDetails,
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
    .getElementById("destroy-tokens")!
    .addEventListener("submit", burnTokens);

  document
    .getElementById("transfer-tokens")!
    .addEventListener("submit", transferTokens);

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
}

async function load() {
  await showPopup();
  setTokenInformation();
  setEventListeners();
}

window.onload = load;
