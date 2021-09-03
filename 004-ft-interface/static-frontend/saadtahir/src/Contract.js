import React, { useState } from "react";
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
import "./App.css";

const network = new StacksTestnet();

function AddManagerContract() {
  const [manager, setManager] = useState("");

  const handleSubmit = async (e) => {
    const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
    const contractName = "my-ft";
    const functionName = "add-manager";
    const principal = standardPrincipalCV(manager);
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Manager Address:
        <input
          type="text"
          value={manager}
          onChange={(s) => setManager(s.target.value)}
        />
      </label>
      <br />
      <input
        className="button"
        type="submit"
        value="Call Add Manager function"
      />
    </form>
  );
}

function PublicContractCall() {
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState("");

  const handleSubmit = async (e) => {
    const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
    const contractName = "app";
    const functionName = "is-goal-scored";
    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [uintCV(score), standardPrincipalCV(player)],
      appDetails: {
        name: "My App",
        icon: window.location.origin + logo,
      },
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log("Stacks Transaction:", data.stacksTransaction);
        console.log("Transaction ID:", data.txId);
        console.log("Raw transaction:", data.txRaw);
      },
    };

    await openContractCall(options);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Player score:
        <input
          type="text"
          value={score}
          onChange={(s) => setScore(s.target.value)}
        />
      </label>
      <br />
      <label>
        Player Address:
        <input
          type="text"
          value={player}
          onChange={(s) => setPlayer(s.target.value)}
        />
      </label>
      <br />
      <input
        className="button"
        type="submit"
        value="Call isGoalScored function"
      />
    </form>
  );
}

function TransferToken() {
  const [amount, setAmount] = useState(0);
  const [sender, setSender] = useState("");
  const [recepient, setRecepient] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = async (e) => {
    const contractAddress = "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK";
    const contractName = "my-ft";
    const tokenName = "my-token";
    const functionName = "transfer";

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [
        uintCV(amount),
        standardPrincipalCV(sender),
        standardPrincipalCV(recepient),
        someCV(bufferCV(Buffer.from(memo))),
      ],
      appDetails: {
        name: "My App",
        icon: window.location.origin + logo,
      },
      postConditions: [
        makeStandardFungiblePostCondition(
          sender,
          FungibleConditionCode.Equal,
          new BN(amount),
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Sender Address:
        <input
          type="text"
          value={sender}
          onChange={(s) => setSender(s.target.value)}
        />
      </label>
      <br />
      <label>
        Recipient Address:
        <input
          type="text"
          value={recepient}
          onChange={(s) => setRecepient(s.target.value)}
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
      <input
        className="button"
        type="submit"
        value="Call TransferTokens function"
      />
    </form>
  );
}

function ReadOnlyContractCall() {
  const handleSubmit = async (e) => {
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
  };

  return (
    <div>
      <button className="button" onClick={handleSubmit}>
        Call get-random-number function
      </button>
    </div>
  );
}

export {
  PublicContractCall,
  ReadOnlyContractCall,
  TransferToken,
  AddManagerContract,
};
