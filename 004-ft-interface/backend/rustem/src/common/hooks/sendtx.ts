import {
  SignedContractCallOptions,
  makeContractCall,
  TxBroadcastResult,
  StacksTransaction,
  broadcastTransaction,
  estimateContractFunctionCall,
} from "@stacks/transactions";

import { useNetwork } from "./use-network"

const network = useNetwork();

export async function sendTx(
    opts: SignedContractCallOptions
  ): Promise<TxBroadcastResult> {
    let transaction: StacksTransaction;

    try {
      transaction = await makeContractCall(opts);
      console.log(`fee: ${transaction.auth.spendingCondition.fee}`);
    } catch (error) {
      console.log("failed to make empty fee transaction, setting fee to 1n:");
      console.log(error.message);
      opts.fee = 1n;
      transaction = await makeContractCall(opts);
    }

    try {
      const ret = await broadcastTransaction(transaction, network);
      if (typeof ret.error === "undefined") {
        return ret;
      } else {
        throw Error(ret.error);
      }
    } catch (error) {
      console.log(
        `failed to broadcast transaction with fee ${transaction.auth.spendingCondition.fee}`
      );
      console.log(error.message);
      console.log(`trying to estimate`);
      const estfee = await estimateContractFunctionCall(transaction, network);
      console.log(`estimated fee: ${estfee}`);
      opts.fee = estfee;
      transaction = await makeContractCall(opts);
      return await broadcastTransaction(transaction, network);
    }
  }