import express from "express";
import {
  AnchorMode,
  broadcastTransaction,
  callReadOnlyFunction,
  ClarityType,
  ClarityValue,
  contractPrincipalCV,
  createAssetInfo,
  cvToJSON,
  FungibleConditionCode,
  makeContractCall,
  makeContractSTXPostCondition,
  makeStandardFungiblePostCondition,
  PostConditionMode,
  ReadOnlyFunctionOptions,
  ResponseCV,
  SignedContractCallOptions,
  StacksTransaction,
  standardPrincipalCV,
  stringAsciiCV,
  TxBroadcastResult,
  uintCV,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import { FungiblePostCondition } from "@stacks/transactions/dist/postcondition";

require("dotenv").config();

const deployerAddress = process.env.DEPLOYER_ADDRESS || "";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const senderAddress = process.env.SENDER_ADDRESS || "";
const senderPrivateKey = process.env.SENDER_PRIVATE_KEY || "";
const tokenContractName = "cosmo-ft";
const storeContractName = "product-store";
const assetName = "cosmo-ft";
const port = process.env.PORT || 3000;
const network = new StacksTestnet();
const explorerBaseUrl = "https://explorer.stacks.co/txid/0x";
const conversionRate = 1000;

const app = express();
var bodyParser = require("body-parser");

function createReadOnlyFunctionOption(
  functionName: string,
  contractName: string,
  functionArgs: ClarityValue[] = [],
  callerAddress: string = deployerAddress
): ReadOnlyFunctionOptions {
  const options: ReadOnlyFunctionOptions = {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    network,
    senderAddress: callerAddress,
  };
  return options;
}

function createSignedContractCallOptions(
  functionName: string,
  contractName: string,
  functionArgs: ClarityValue[],
  senderKey: string = deployerPrivateKey
): SignedContractCallOptions {
  const txOptions: SignedContractCallOptions = {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName,
    functionArgs,
    senderKey: senderKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
  };
  return txOptions;
}

function createFungibleAssetPostCondition(
  amount: string,
  conditionCode: FungibleConditionCode
): FungiblePostCondition {
  const postConditionAddress = senderAddress;
  const postConditionCode = conditionCode;
  const postConditionAmount: number = Number(amount);
  const fungibleAssetInfo = createAssetInfo(
    deployerAddress,
    tokenContractName,
    assetName
  );

  const fungiblePostCondition: FungiblePostCondition =
    makeStandardFungiblePostCondition(
      postConditionAddress,
      postConditionCode,
      postConditionAmount,
      fungibleAssetInfo
    );

  return fungiblePostCondition;
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.post("/", async (req, res) => {
  const tokenName = await getTokenName();
  const tokenSymbol = await getTokenSymbol();
  const tokenSupply = await getTokenSupply();
  res.send({
    tokenName: tokenName,
    tokenSymbol: tokenSymbol,
    tokenSupply: tokenSupply,
  });
});

app.get("/get-token-uri", async function (req, res) {
  try {
    const options = createReadOnlyFunctionOption(
      "get-token-uri",
      tokenContractName
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    res.end(jsonResponse.value.value.value);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/check-balance", async function (req, res) {
  try {
    const options = createReadOnlyFunctionOption(
      "get-balance-of",
      tokenContractName,
      [standardPrincipalCV(req.body.address.toString())]
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    res.end(jsonResponse.value.value);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/get-tokens", async function (req, res) {
  try {
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions("issue-token", tokenContractName, [
        uintCV(10),
        standardPrincipalCV(req.body.address.toString()),
      ]);
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    console.log(error);
    res.end(JSON.stringify(error));
  }
});

app.post("/destroy-tokens", async function (req, res) {
  try {
    var fungibleAssetPostCondition = createFungibleAssetPostCondition(
      req.body.amount.toString(),
      FungibleConditionCode.Equal
    );
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions(
        "destroy-token",
        tokenContractName,
        [
          uintCV(req.body.amount.toString()),
          standardPrincipalCV(senderAddress),
        ],
        senderPrivateKey
      );
    txOptions.postConditions = [fungibleAssetPostCondition];
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/transfer-tokens", async function (req, res) {
  try {
    var fungibleAssetPostCondition = createFungibleAssetPostCondition(
      req.body.amount.toString(),
      FungibleConditionCode.Equal
    );
    var txOptions: SignedContractCallOptions = createSignedContractCallOptions(
      "transfer",
      tokenContractName,
      [
        uintCV(req.body.amount.toString()),
        standardPrincipalCV(senderAddress),
        standardPrincipalCV(req.body.recipientAddress.toString()),
      ],
      senderPrivateKey
    );
    txOptions.postConditions = [fungibleAssetPostCondition];
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/add-valid-contract-caller", async function (req, res) {
  try {
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions(
        "add-valid-contract-caller",
        tokenContractName,
        [
          contractPrincipalCV(
            req.body.deployerAddress.toString(),
            req.body.contractName.toString()
          ),
        ],
        deployerPrivateKey
      );
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/get-product-price", async function (req, res) {
  try {
    const options: ReadOnlyFunctionOptions = createReadOnlyFunctionOption(
      "get-product-price",
      storeContractName,
      [stringAsciiCV(req.body.productName.toString())]
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    res.end(JSON.stringify(jsonResponse));
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/get-bonus-points-count", async function (req, res) {
  try {
    const options: ReadOnlyFunctionOptions = createReadOnlyFunctionOption(
      "get-bonus-points-count",
      storeContractName,
      [],
      req.body.address.toString()
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    res.end(jsonResponse.value.value);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/delete-product", async function (req, res) {
  try {
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions("delete-product", storeContractName, [
        stringAsciiCV(req.body.productName.toString()),
      ]);
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/add-product", async function (req, res) {
  try {
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions("add-product", storeContractName, [
        stringAsciiCV(req.body.productName.toString()),
        uintCV(req.body.price),
        uintCV(req.body.quantity),
      ]);
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    console.log(result);
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    console.log(error);
    res.end(JSON.stringify(error));
  }
});

app.post("/buy-product", async function (req, res) {
  try {
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions(
        "buy-product",
        storeContractName,
        [stringAsciiCV(req.body.productName.toString())],
        senderPrivateKey
      );
    txOptions.postConditionMode = PostConditionMode.Allow;
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    console.log(result);
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/transfer-reward-tokens", async function (req, res) {
  try {
    var fungibleAssetPostCondition = createFungibleAssetPostCondition(
      req.body.amount.toString(),
      FungibleConditionCode.Equal
    );
    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions(
        "transfer-reward-tokens",
        storeContractName,
        [
          uintCV(req.body.amount.toString()),
          standardPrincipalCV(req.body.recipientAddress.toString()),
        ],
        senderPrivateKey
      );
    txOptions.postConditions = [fungibleAssetPostCondition];
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.post("/redeem-reward-tokens", async function (req, res) {
  try {
    var fungibleAssetPostCondition = createFungibleAssetPostCondition(
      req.body.amount.toString(),
      FungibleConditionCode.Equal
    );

    const STXPostConditionCode = FungibleConditionCode.Equal;
    const STXPostConditionAmount =
      Number(req.body.amount.toString()) / conversionRate;
    const contractSTXPostCondition = makeContractSTXPostCondition(
      deployerAddress,
      storeContractName,
      STXPostConditionCode,
      STXPostConditionAmount
    );

    const txOptions: SignedContractCallOptions =
      createSignedContractCallOptions(
        "redeem-reward-tokens",
        storeContractName,
        [uintCV(req.body.amount.toString())],
        senderPrivateKey
      );
    txOptions.postConditions = [
      fungibleAssetPostCondition,
      contractSTXPostCondition,
    ];
    const transaction: StacksTransaction = await makeContractCall(txOptions);
    const result: TxBroadcastResult = await broadcastTransaction(
      transaction,
      network
    );
    if (result.error) {
      throw result;
    }
    res.redirect(explorerBaseUrl + result.txid);
  } catch (error) {
    res.end(JSON.stringify(error));
  }
});

app.listen(port, () => {
  console.log(`server is listening at http://localhost:${port}`);
});

async function getTokenName(): Promise<String> {
  try {
    const options = createReadOnlyFunctionOption("get-name", tokenContractName);
    const result = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    return jsonResponse.value.value;
  } catch (error) {
    return "";
  }
}

async function getTokenSymbol(): Promise<String> {
  try {
    const options = createReadOnlyFunctionOption(
      "get-symbol",
      tokenContractName
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    return jsonResponse.value.value;
  } catch (error) {
    return "";
  }
}

async function getTokenSupply(): Promise<String> {
  try {
    const options = createReadOnlyFunctionOption(
      "get-total-supply",
      tokenContractName
    );
    const result: ClarityValue = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(result);
    return jsonResponse.value.value;
  } catch (error) {
    return "";
  }
}
