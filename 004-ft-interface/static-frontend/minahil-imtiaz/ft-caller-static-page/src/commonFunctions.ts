import { ContractCallOptions, UserSession } from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import {
  callReadOnlyFunction,
  ClarityValue,
  createAssetInfo,
  cvToJSON,
  FungibleConditionCode,
  makeStandardFungiblePostCondition,
  ReadOnlyFunctionOptions,
  standardPrincipalCV,
} from "@stacks/transactions";
import { FungiblePostCondition } from "@stacks/transactions/dist/transactions/src/postcondition";
import BN from "bn.js";

export const network = new StacksTestnet();
export const deployerAddress = "ST3F9BYX07T0Q51JT2YVXT532BNZGY78KT7ZMH6KC";
export const tokenContractName = "cosmo-ft";
export const storeContractName = "product-store";
export const assetName = "cosmo-ft";
export const explorerBaseUrl = "https://explorer.stacks.co/txid/0x";
export const appDetails = {
  name: "Product Store",
  icon: window.location.origin + "/src/icon.jpg",
};

export function createReadOnlyFunctionOption(
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

export function createContractCallOptions(
  contractName: string,
  functionName: string,
  outputElementId: string,
  userSession: UserSession,
  functionArguments: ClarityValue[] = []
): ContractCallOptions {
  return {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArguments,
    appDetails: appDetails,
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

export function createFungibleAssetPostCondition(
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

export async function getTokenName() {
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

export async function getTokenSymbol() {
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

export async function getTokenSupply() {
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

export async function getUserBalance(address: string) {
  const options = createReadOnlyFunctionOption(
    "get-balance-of",
    tokenContractName,
    [standardPrincipalCV(address)]
  );
  const result = await callReadOnlyFunction(options);
  return result;
}
