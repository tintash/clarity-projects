"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTx = void 0;
const transactions_1 = require("@stacks/transactions");
const use_network_1 = require("./use-network");
const network = (0, use_network_1.useNetwork)();
async function sendTx(opts) {
    let transaction;
    try {
        transaction = await (0, transactions_1.makeContractCall)(opts);
        console.log(`fee: ${transaction.auth.spendingCondition.fee}`);
    }
    catch (error) {
        console.log("failed to make empty fee transaction, setting fee to 1n:");
        console.log(error.message);
        opts.fee = 1n;
        transaction = await (0, transactions_1.makeContractCall)(opts);
    }
    try {
        const ret = await (0, transactions_1.broadcastTransaction)(transaction, network);
        if (typeof ret.error === "undefined") {
            return ret;
        }
        else {
            throw Error(ret.error);
        }
    }
    catch (error) {
        console.log(`failed to broadcast transaction with fee ${transaction.auth.spendingCondition.fee}`);
        console.log(error.message);
        console.log(`trying to estimate`);
        const estfee = await (0, transactions_1.estimateContractFunctionCall)(transaction, network);
        console.log(`estimated fee: ${estfee}`);
        opts.fee = estfee;
        transaction = await (0, transactions_1.makeContractCall)(opts);
        return await (0, transactions_1.broadcastTransaction)(transaction, network);
    }
}
exports.sendTx = sendTx;
