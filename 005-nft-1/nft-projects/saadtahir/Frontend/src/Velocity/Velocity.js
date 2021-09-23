import React, { useEffect, useState } from "react";
import { AppConfig, openContractCall, UserSession } from "@stacks/connect";
import {
  callReadOnlyFunction,
  cvToValue,
  PostConditionMode,
  standardPrincipalCV,
} from "@stacks/transactions";
import { StacksMocknet, StacksTestnet } from "@stacks/network";
import "./Velocity.css";
import logo from "../velocity.svg";
import * as constants from "../Constants";

const testnet = new StacksTestnet();
const mocknet = new StacksMocknet();
const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function GetUserProfile() {
  return userSession.loadUserData().profile.stxAddress;
}

function GetLastTokenId({ handleFreeTokens }) {
  const [soldTokens, setSoldTokens] = useState(0);
  const profile = GetUserProfile();

  useEffect(() => {
    async function handleSubmit() {
      const options = {
        contractAddress: constants.contractAddress,
        contractName: constants.velocityContract,
        functionName: constants.getLastTokenId,
        functionArgs: [],
        network: testnet,
        senderAddress: profile.testnet,
      };
      try {
        const result = await callReadOnlyFunction(options);
        const tokens = cvToValue(result.value);
        const freeTokens = constants.tokensForFree - tokens;
        setSoldTokens(tokens);
        handleFreeTokens(freeTokens);
      } catch (err) {
        console.log(err);
      }
    }
    handleSubmit();
  }, [soldTokens, profile, handleFreeTokens]);

  return (
    <div>
      <h2>Tokens sold: {soldTokens}</h2>
      <h2>
        There are total of {constants.totalTokens} Velocity NFTs to be claimed
      </h2>
    </div>
  );
}

function Claim({ freeTokens }) {
  const handleSubmit = async () => {
    const options = {
      contractAddress: constants.contractAddress,
      contractName: constants.velocityContract,
      functionName: constants.claim,
      functionArgs: [],
      appDetails: {
        name: constants.appName,
        icon: window.location.origin + logo,
      },
      network: testnet,
      postConditionCode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log("Stacks Transaction:", data.stacksTransaction);
        console.log("Transaction ID:", data.txId);
        console.log("Raw transaction:", data.txRaw);
      },
    };
    await openContractCall(options);
  };
  return (
    <div>
      {freeTokens < constants.tokensForFree ? (
        <div>
          <h3>Hurry up! Free NFTs are limited! Only {freeTokens} are left</h3>
          <button className="submit-button" onClick={handleSubmit}>
            Claim
          </button>
        </div>
      ) : (
        <div>
          <h3>
            Buy Velocity now! They cost as low as {constants.tokenCost} micro
            STX
          </h3>
          <button className="submit-button" onClick={handleSubmit}>
            Claim
          </button>
        </div>
      )}
    </div>
  );
}

function GetTotalTokens() {
  const [ownerTokenBalance, setOwnerTokenBalance] = useState(0);
  const profile = GetUserProfile();
  const ownerAddress = standardPrincipalCV(profile.testnet);

  useEffect(() => {
    const handleSubmit = async () => {
      const options = {
        contractAddress: constants.contractAddress,
        contractName: constants.velocityContract,
        functionName: constants.balanceOf,
        functionArgs: [ownerAddress],
        network: testnet,
        senderAddress: profile.testnet,
      };
      try {
        const result = await callReadOnlyFunction(options);
        const response = cvToValue(result);
        console.log(response);
        setOwnerTokenBalance(response);
      } catch (err) {
        console.log(err);
      }
    };
    handleSubmit();
  });

  return (
    <div>
      <h1>You own {ownerTokenBalance} tokens</h1>
    </div>
  );
}

export { GetLastTokenId, Claim, GetTotalTokens };
