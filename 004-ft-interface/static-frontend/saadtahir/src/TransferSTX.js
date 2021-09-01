import { openSTXTransfer } from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import {
  AnchorMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  PostConditionMode,
} from "@stacks/transactions";
import logo from "./logo.svg";
import BN from "bn.js";

const network = new StacksTestnet();

function TransferSTX() {
  const recipient = "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH"; //Account 2 address
  const amount = "100";
  const memo = "Reimbursement";
  const postConditions = [
    makeStandardSTXPostCondition(
      "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK",
      FungibleConditionCode.Equal,
      new BN(100)
    ),
  ];
  openSTXTransfer({
    recipient,
    amount,
    memo,
    network,
    appDetails: {
      name: "My App",
      icon: window.location.origin + logo,
    },
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish: onFinishTransferStx,
  });
}

function onFinishTransferStx(data) {
  console.log("Stacks Transaction:", data.stacksTransaction);
  console.log("Transaction ID:", data.txId);
  console.log("Raw transaction:", data.txRaw);
}

export default TransferSTX;
