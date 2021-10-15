/* eslint-disable import/no-extraneous-dependencies */
import {
  callReadOnlyFunction,
  createAssetInfo,
  cvToValue,
  FungibleConditionCode,
  makeContractNonFungiblePostCondition,
  makeStandardNonFungiblePostCondition,
  makeStandardSTXPostCondition,
  NonFungibleConditionCode,
  PostConditionMode,
  uintCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksMocknet } from '@stacks/network';
import BN from 'bn.js';

import * as constants from './constants';
import loadImage from './Storage/LoadImage';
import { userSession, getUserData } from './auth';

export const setOptions = (funcName, args = []) => ({
  contractAddress: constants.contractAddress,
  contractName: constants.velocityContract,
  functionName: funcName,
  functionArgs: args,
  network: new StacksMocknet(),
  senderAddress: getUserData().profile.stxAddress.testnet,
});

export const checkUserTokens = async () => {
  const ownerAddress = standardPrincipalCV(getUserData().profile.stxAddress.testnet);
  const options = setOptions(constants.balanceOf, [ownerAddress]);
  try {
    const result = await callReadOnlyFunction(options);
    const response = cvToValue(result);
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const getUserTokens = async () => {
  const promises = [];
  const tokens = [];
  let tokenUrls = [];
  const ownerAddress = standardPrincipalCV(getUserData().profile.stxAddress.testnet);
  const options = setOptions(constants.getTokens, [ownerAddress]);

  try {
    const result = await callReadOnlyFunction(options);
    const response = cvToValue(result);
    response.forEach((res) => {
      promises.push(loadImage(res.value));
    });
    tokenUrls = await Promise.all(promises);
    response.forEach((res, index) => {
      tokens.push({ id: res.value, url: tokenUrls[index] });
    });
    return tokens;
  } catch (err) {
    console.log(err);
  }
};

export const getAllTokens = async (pageNumber) => {
  const loopStart = ((pageNumber - 1) * 25) + 1;
  const loopEnd = pageNumber * 25;
  const promises = [];
  const tokens = [];
  let tokenUrls = [];

  try {
    for (let i = loopStart; i <= loopEnd; i++) {
      promises.push(loadImage((i % 21) + 1));
    }
    tokenUrls = await Promise.all(promises);
    for (let i = loopStart; i <= loopEnd; i++) {
      tokens.push({ id: i, image: tokenUrls[(i % 21) + 1] });
    }
    return tokens;
  } catch (err) {
    console.log(err);
  }
};

export const checkForSale = async (tokenId) => {
  const options = {
    contractAddress: constants.contractAddress,
    contractName: constants.velocityMarketContract,
    functionName: constants.getVelocityForSale,
    functionArgs: [uintCV(tokenId)],
    network: new StacksMocknet(),
    senderAddress: getUserData().profile.stxAddress.testnet,
  };
  let tokenDetails = null;
  try {
    const result = await callReadOnlyFunction(options);
    const response = cvToValue(result);
    if (response === null) {
      tokenDetails = {
        price: 0,
        sellerId: '',
      };
    } else {
      tokenDetails = {
        price: response.value.price.value,
        sellerId: response.value.seller.value,
      };
    }
    return tokenDetails;
  } catch (err) {
    console.log(err);
  }
};

export const checkFreeTokens = async () => {
  const options = setOptions(constants.getLastTokenId);
  try {
    const result = await callReadOnlyFunction(options);
    const tokens = cvToValue(result.value);
    const freeTokens = constants.tokensForFree - tokens;
    return freeTokens;
  } catch (err) {
    console.log(err);
  }
};

export const claimTokens = async (setIsSelected) => {
  const options = {
    contractAddress: constants.contractAddress,
    contractName: constants.velocityContract,
    functionName: constants.claim,
    functionArgs: [],
    appDetails: {
      name: 'Training-App',
      icon: `${window.location.origin}/logo.svg`,
    },
    network: new StacksMocknet(),
    postConditionCode: PostConditionMode.Deny,
    onFinish: () => {
      setIsSelected(false);
    },
    onCancel: () => {
      setIsSelected(false);
    },
  };
  await openContractCall(options);
};

export const buyToken = async (tokenId, tokenPrice, setButtonSelected) => {
  const nftTransferPostCondition = makeContractNonFungiblePostCondition(
    constants.contractAddress,
    constants.velocityMarketContract,
    NonFungibleConditionCode.DoesNotOwn,
    createAssetInfo(
      constants.assetAddress,
      constants.assetContractName,
      constants.assetName,
    ),
    uintCV(tokenId),
  );
  const stxPostCondition = makeStandardSTXPostCondition(
    getUserData().profile.stxAddress.testnet,
    FungibleConditionCode.Equal,
    new BN(tokenPrice),
  );

  const options = {
    contractAddress: constants.contractAddress,
    contractName: constants.velocityMarketContract,
    functionName: constants.buyVelocity,
    functionArgs: [uintCV(tokenId)],
    appDetails: {
      name: 'Training-App',
      icon: `${window.location.origin}/logo.svg`,
    },
    network: new StacksMocknet(),
    userSession,
    postConditions: [nftTransferPostCondition, stxPostCondition],
    postConditionMode: PostConditionMode.Deny,
    onFinish: () => {
      setButtonSelected(false);
    },
    onCancel: () => {
      setButtonSelected(false);
    },
  };

  await openContractCall(options);
};

export const sellToken = async (tokenId, tokenPrice, setSelected) => {
  if (tokenPrice < 10000) {
    alert('Token Price too low');
    return;
  }

  const standardNFTPostCondition = makeStandardNonFungiblePostCondition(
    getUserData().profile.stxAddress.testnet,
    NonFungibleConditionCode.DoesNotOwn,
    createAssetInfo(
      constants.assetAddress,
      constants.assetContractName,
      constants.assetName,
    ),
    uintCV(tokenId),
  );

  const options = {
    contractAddress: constants.contractAddress,
    contractName: constants.velocityMarketContract,
    functionName: constants.putVelocityForSale,
    functionArgs: [uintCV(tokenId), uintCV(tokenPrice)],
    appDetails: {
      name: 'Training-App',
      icon: `${window.location.origin}/logo.svg`,
    },
    network: new StacksMocknet(),
    userSession,
    postConditions: [standardNFTPostCondition],
    postConditionMode: PostConditionMode.Deny,
    onFinish: () => {
      setSelected(false);
    },
    onCancel: () => {
      setSelected(false);
    },
  };

  await openContractCall(options);
};
