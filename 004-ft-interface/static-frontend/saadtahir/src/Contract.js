import { openContractCall } from "@stacks/connect";
import { standardPrincipalCV } from "@stacks/transactions";
import logo from "./logo.svg";

const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
const contractName = "app";
const functionName = "goal-score";
const principal = standardPrincipalCV(
  "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH"
);

export default async function ContractCall() {
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
