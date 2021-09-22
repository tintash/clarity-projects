import React, { useEffect, useState } from "react";
import { AppConfig, openContractCall, UserSession } from "@stacks/connect";
import {
  callReadOnlyFunction,
  createAssetInfo,
  cvToValue,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
} from "@stacks/transactions";
import { StacksMocknet } from "@stacks/network";
import logo from "../velocity.svg";
import "./SellToken.css";
import * as constants from "../Constants";
import * as Meta from "../MetaData/TokenMeta";

const network = new StacksMocknet();
const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function GetUserProfile() {
  return userSession.loadUserData().profile.stxAddress;
}

function SellToken() {
  return (
    <div>
      <h1>Welcome to Token Trading Page</h1>
      <p>Here you can put your velocity for sale</p>
      <PutVelocityForSale />
      <GetOwnerNFTs />
    </div>
  );
}

function GetOwnerNFTs() {
  const [ownerTokens, setOwnerTokens] = useState([]);
  const profile = GetUserProfile();
  const ownerAddress = standardPrincipalCV(profile.testnet);

  useEffect(() => {
    const handleSubmit = async () => {
      const options = {
        contractAddress: constants.contractAddress,
        contractName: constants.velocityContract,
        functionName: constants.getTokens,
        functionArgs: [ownerAddress],
        network,
        senderAddress: profile.testnet,
      };
      try {
        const result = await callReadOnlyFunction(options);
        const response = cvToValue(result);
        console.log(response);
        setOwnerTokens(response);
      } catch (err) {
        console.log(err);
      }
    };
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <br />
      {ownerTokens.length > 0 && <h1>You own {ownerTokens.length} tokens</h1>}
      {ownerTokens.length > 0 &&
        ownerTokens.map((token) => {
          return (
            <div className="gallery">
              <img
                src={Meta.tokenMeta[token.value].url}
                alt={logo}
                width="250"
                height="200"
              />
              <div className="desc">Token ID: {token.value}</div>
            </div>
          );
        })}
    </div>
  );
}

function PutVelocityForSale() {
  const profile = GetUserProfile();
  const [tokenId, setTokenId] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(10000);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Selling NFT");
    console.log("tokenId: " + tokenId);
    console.log("tokenPrice: " + tokenPrice);

    const contractAddress = constants.contractAddress;
    const contractName = constants.velocityMarketContract;
    const functionName = constants.putVelocityForSale;
    const standardNFTPostCondition = makeStandardNonFungiblePostCondition(
      profile.testnet,
      NonFungibleConditionCode.DoesNotOwn,
      createAssetInfo(
        constants.assetAddress,
        constants.assetContractName,
        constants.assetName
      ),
      uintCV(tokenId)
    );
    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [
        uintCV(tokenId),
        uintCV(tokenPrice),
        standardPrincipalCV(profile.testnet),
      ],
      appDetails: {
        name: constants.appName,
        icon: window.location.origin + logo,
      },
      network,
      userSession,
      postConditions: [standardNFTPostCondition],
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
        Enter Token Id:
        <input
          type="number"
          value={tokenId}
          onChange={(s) => setTokenId(s.target.value)}
        />
      </label>
      <br />
      <label>
        Enter Token Price (min 10000STX):
        <input
          type="number"
          value={tokenPrice}
          onChange={(s) => setTokenPrice(s.target.value)}
        />
      </label>
      <input className="button" type="submit" value="Sale" />
    </form>
  );
}

export default SellToken;
