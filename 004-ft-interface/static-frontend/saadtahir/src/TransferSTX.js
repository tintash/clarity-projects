import { openSTXTransfer } from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import logo from "./logo.svg";

const recipient = "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH"; //Account 2 address
const amount = "100";
const memo = "Reimbursement";
const network = new StacksTestnet();

function TransferSTX() {
  openSTXTransfer({
    recipient,
    amount,
    memo,
    network,
    appDetails: {
      name: "My App",
      icon: window.location.origin + logo,
    },
    onFinish: onFinish,
  });
}

function onFinish(data) {
  console.log("Stacks Transaction:", data.stacksTransaction);
  console.log("Transaction ID:", data.txId);
  console.log("Raw transaction:", data.txRaw);
}

export default TransferSTX;
