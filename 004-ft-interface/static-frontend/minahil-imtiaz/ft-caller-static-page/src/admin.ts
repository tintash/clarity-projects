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
  cvToJSON,
  FungibleConditionCode,
  ClarityValue,
  standardPrincipalCV,
  stringAsciiCV,
  contractPrincipalCV,
} from "@stacks/transactions";
import {
  appDetails,
  createContractCallOptions,
  createFungibleAssetPostCondition,
  getTokenName,
  getTokenSupply,
  getTokenSymbol,
  getUserBalance,
  storeContractName,
  tokenContractName,
} from "./commonFunctions";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
let userData: UserData;
let userAddress = "";

async function getBalance(e: Event) {
  e.preventDefault();
  try {
    const inquiryAddress = (<HTMLInputElement>(
      document.getElementById("balance-inquiry-address")
    )).value;
    const result = await getUserBalance(inquiryAddress.toString());
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
    userSession,
    [uintCV(amount), standardPrincipalCV(recipientAddress)]
  );
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
    userSession,
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
    userSession,
    [contractPrincipalCV(callerDeployerAddress, callerContractName)]
  );
  await openContractCall(opts);
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
    userSession,
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
    userSession,
    callArguments
  );
  await openContractCall(opts);
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
    .getElementById("issue-tokens")!
    .addEventListener("submit", getTokens);

  document
    .getElementById("destroy-tokens")!
    .addEventListener("submit", burnTokens);

  document
    .getElementById("add-valid-contract-caller")!
    .addEventListener("submit", addValidContractCaller);

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
