import React, { useState } from "react";
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
import "./App.css";

const network = new StacksTestnet();

function TransferSTX(props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`recipient: ${recipient}`);
    console.log(`amount: ${amount}`);
    console.log(`memo: ${memo}`);

    const postConditions = [
      makeStandardSTXPostCondition(
        recipient,
        FungibleConditionCode.Equal,
        new BN(amount)
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
      onFinish: (data) => {
        console.log("Stacks Transaction:", data.stacksTransaction);
        console.log("Transaction ID:", data.txId);
        console.log("Raw transaction:", data.txRaw);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Recipient:
        <input
          type="text"
          value={recipient}
          onChange={(s) => setRecipient(s.target.value)}
        />
      </label>
      <br />
      <label>
        Amount:
        <input
          type="text"
          value={amount}
          onChange={(s) => setAmount(s.target.value)}
        />
      </label>
      <br />
      <label>
        Memo:
        <input
          type="text"
          value={memo}
          onChange={(s) => setMemo(s.target.value)}
        />
      </label>
      <br />
      <input className="button" type="submit" value="Transfer STX" />
    </form>
  );
}

export default TransferSTX;
