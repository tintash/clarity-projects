import React, { useState } from "react";
import { AppConfig, openContractCall, UserSession } from "@stacks/connect";
import {
  callReadOnlyFunction,
  createAssetInfo,
  cvToValue,
  FungibleConditionCode,
  makeContractNonFungiblePostCondition,
  makeStandardSTXPostCondition,
  NonFungibleConditionCode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
} from "@stacks/transactions";
import { StacksMocknet, StacksTestnet } from "@stacks/network";
import "./BuyToken.css";
import * as constants from "../Constants";
import logo from "../velocity.svg";
import BN from "bn.js";

const testnet = new StacksTestnet();
const mocknet = new StacksMocknet();
const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function GetUserProfile() {
  return userSession.loadUserData().profile.stxAddress;
}

function BuyToken() {
  return (
    <div>
      <h1>Welcome to Token Trading Page</h1>
      <p>Here you can buy velocity</p>
      <GetNFTsForSale />
    </div>
  );
}

function GetNFTsForSale() {
  const profile = GetUserProfile();
  const [tokenId, setTokenId] = useState(0);
  const [tokenSeller, setTokenSeller] = useState("");
  const [tokenPrice, setTokenPrice] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const options = {
      contractAddress: constants.contractAddress,
      contractName: constants.velocityMarketContract,
      functionName: constants.getVelocityForSale,
      functionArgs: [uintCV(tokenId)],
      network: testnet,
      senderAddress: profile.testnet,
    };
    try {
      const result = await callReadOnlyFunction(options);
      const response = cvToValue(result);
      if (response == null) {
        setTokenPrice(0);
        setTokenSeller("");
      } else {
        setTokenPrice(response.value.price.value);
        setTokenSeller(response.value.seller.value);
      }
    } catch (err) {
      console.log(err);
    }
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
      <input className="button" type="submit" value="Check" />
      <br />
      {tokenSeller !== "" ? (
        <div>
          <h1>This NFT is available for sale.</h1>
          <h2>Price: {tokenPrice}</h2>
          <h2>Seller: {tokenSeller}</h2>
          <BuyVelocity
            tokenId={tokenId}
            tokenPrice={tokenPrice}
            tokenSeller={tokenSeller}
          />
        </div>
      ) : (
        <div>
          <h1>This NFT is not available for sale</h1>
        </div>
      )}
    </form>
  );
}

function BuyVelocity(props) {
  const profile = GetUserProfile();
  const tokenId = props.tokenId;
  const tokenPrice = props.tokenPrice;
  const tokenSeller = props.tokenSeller;

  const handleSubmit = async (e) => {
    console.log("TokenID: " + tokenId);
    console.log("TokenPrice: " + tokenPrice);
    console.log("TokenSeller: " + tokenSeller);

    const contractAddress = constants.contractAddress;
    const contractName = constants.velocityMarketContract;
    const functionName = constants.buyVelocity;
    const nftTransferPostCondition = makeContractNonFungiblePostCondition(
      contractAddress,
      contractName,
      NonFungibleConditionCode.DoesNotOwn,
      createAssetInfo(
        constants.assetAddress,
        constants.assetContractName,
        constants.assetName
      ),
      uintCV(tokenId)
    );
    const stxPostCondition = makeStandardSTXPostCondition(
      profile.testnet,
      FungibleConditionCode.Equal,
      new BN(tokenPrice)
    );

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [uintCV(tokenId)],
      appDetails: {
        name: constants.appName,
        icon: window.location.origin + logo,
      },
      network: testnet,
      userSession,
      postConditions: [nftTransferPostCondition, stxPostCondition],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log("Stacks Transaction:", data.stacksTransaction);
        console.log("Transaction ID: 0x", data.txId);
        console.log("Raw transaction:", data.txRaw);
      },
    };

    await openContractCall(options);
  };
  return (
    <div>
      <button onClick={handleSubmit}>Buy Velocity</button>
    </div>
  );
}

export default BuyToken;
