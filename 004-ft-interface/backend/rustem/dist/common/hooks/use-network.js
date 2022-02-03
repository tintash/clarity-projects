"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNetwork = void 0;
const network_1 = require("@stacks/network");
const constants_1 = require("../constants");
const useNetwork = () => {
    const network = constants_1.devnet
        ? new network_1.StacksMocknet({ url: constants_1.STACKS_API_URL })
        : new network_1.StacksTestnet({ url: constants_1.STACKS_API_URL });
    return network;
};
exports.useNetwork = useNetwork;
