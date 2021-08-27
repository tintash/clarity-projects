import { openContractCall } from "@stacks/connect";
import {
  standardPrincipalCV,
  callReadOnlyFunction,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import logo from "./logo.svg";

const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
const contractName = "app";
const functionName = "goal-score";
const principal = standardPrincipalCV(
  "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH"
);
const network = new StacksTestnet();

async function PublicContractCall() {
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

async function ReadOnlyContractCall() {
  const options = {
    contractAddress,
    contractName,
    functionName: "get-random-number",
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

export { PublicContractCall, ReadOnlyContractCall };
