import React, { useEffect, useState } from "react";
import { AppConfig, openContractCall, UserSession } from "@stacks/connect";
import {
  callReadOnlyFunction,
  createAssetInfo,
  cvToValue,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
  PostConditionMode,
  stringAsciiCV,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import "./Velocity.css";
import logo from "../velocity.svg";
import * as constants from "../Constants";

const network = new StacksTestnet();
const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function GetUserProfile() {
  return userSession.loadUserData().profile.stxAddress;
}

function GetLastTokenId() {
  const [soldTokens, setSoldTokens] = useState(0);
  const [freeTokens, setFreeTokens] = useState(0);
  const [stxTokens, setStxTokens] = useState(0);
  const profile = GetUserProfile();

  useEffect(() => {
    async function handleSubmit() {
      const options = {
        contractAddress: constants.contractAddress,
        contractName: constants.velocityContract,
        functionName: constants.getLastTokenId,
        functionArgs: [],
        network,
        senderAddress: profile.testnet,
      };
      try {
        const result = await callReadOnlyFunction(options);
        const tokens = cvToValue(result.value);
        console.log("Function Succeded: " + tokens);
        setSoldTokens(tokens);
        setFreeTokens(constants.tokensForFree - tokens);
        setStxTokens(constants.totalTokens - constants.tokensForFree - tokens);
      } catch (err) {
        console.log(err);
        console.log("Function failed with error: " + err); // TypeError: failed to fetch
      }
    }
    handleSubmit();
  }, [soldTokens, freeTokens, stxTokens, profile]);

  return (
    <div>
      <h2>Tokens sold: {soldTokens}</h2>
      <h2>Tokens yet to be claimed for free: {freeTokens}</h2>
      <h2>Tokens yet to be claimed for STX: {stxTokens}</h2>
    </div>
  );
}

function ClaimForFree() {
  const handleClaim = async () => {
    const profile = GetUserProfile();
    const postConditionAddress = profile.testnet;
    const postConditionCode = NonFungibleConditionCode.DoesNotOwn;
    const nonFungibleAssetInfo = createAssetInfo(
      constants.assetAddress,
      constants.assetContractName,
      constants.assetName
    );
    const standardNonFungiblePostCondition =
      makeStandardNonFungiblePostCondition(
        postConditionAddress,
        postConditionCode,
        nonFungibleAssetInfo,
        stringAsciiCV(constants.tokenAssetName)
      );

    const options = {
      contractAddress: constants.contractAddress,
      contractName: constants.velocityContract,
      functionName: constants.claim,
      functionArgs: [],
      appDetails: {
        name: constants.appName,
        icon: window.location.origin + logo,
      },
      postConditions: [standardNonFungiblePostCondition],
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
      <h3>Hurry up! Free NFTs are limited!</h3>
      <button className="claim-button" onClick={handleClaim}>
        Claim
      </button>
    </div>
  );
}

export { GetLastTokenId, ClaimForFree };
