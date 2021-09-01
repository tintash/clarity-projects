import { openContractCall } from "@stacks/connect";
import {
  standardPrincipalCV,
  uintCV,
  bufferCV,
  callReadOnlyFunction,
  someCV,
  PostConditionMode,
  makeStandardFungiblePostCondition,
  FungibleConditionCode,
  createAssetInfo,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import logo from "./logo.svg";
import BN from "bn.js";

const network = new StacksTestnet();

async function PublicContractCall() {
  const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
  const contractName = "app";
  const functionName = "goal-score";
  const principal = standardPrincipalCV(
    "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH"
  );
  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [principal],
    appDetails: {
      name: "My App",
      icon: window.location.origin + logo,
    },
    onFinish: (data) => {
      console.log("Stacks Transaction:", data.stacksTransaction);
      console.log("Transaction ID:", data.txId);
      console.log("Raw transaction:", data.txRaw);
    },
  };

  await openContractCall(options);
}

async function TransferToken() {
  const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
  const contractName = "my-ft";
  const tokenName = "my-token";
  const functionName = "transfer";
  const amount = uintCV(100);
  const sender = standardPrincipalCV(
    "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK"
  );
  const recepient = standardPrincipalCV(
    "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH"
  );
  const memo = someCV(bufferCV(Buffer.from("hello, world")));

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [amount, sender, recepient, memo],
    appDetails: {
      name: "My App",
      icon: window.location.origin + logo,
    },
    postConditions: [
      makeStandardFungiblePostCondition(
        "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK",
        FungibleConditionCode.Equal,
        new BN(100),
        createAssetInfo(contractAddress, contractName, tokenName)
      ),
    ],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log("Stacks Transaction:", data.stacksTransaction);
      console.log("Transaction ID:", data.txId);
      console.log("Raw transaction:", data.txRaw);
    },
  };

  await openContractCall(options);
}

async function ReadOnlyContractCall() {
  const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
  const contractName = "app";
  const functionName = "get-random-number";

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [],
    network,
    senderAddress: "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK",
  };

  try {
    const result = await callReadOnlyFunction(options);
    console.log(result);
    console.log("Function Succeded: " + result.value.value);
  } catch (err) {
    console.log(err);
    console.log("Function failed with error: " + err); // TypeError: failed to fetch
  }
}

export { PublicContractCall, ReadOnlyContractCall, TransferToken };
