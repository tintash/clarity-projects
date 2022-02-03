"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STACKS_API_URL = exports.devnet = exports.DAO_FT_VOTE_PROPOSAL = exports.DAO_FT_CREATE_PROPOSAL = exports.DAO_FT_MINT = exports.DAO_FT_IS_PROPOSAL_SUCCEEDED = exports.DAO_FT_GET_PROPOSAL = exports.DAO_FT_URI = exports.DAO_FT_SUPPLY = exports.DAO_FT_DECIMALS = exports.DAO_FT_SYMBOL = exports.DAO_FT_NAME = exports.DAO_FT_CONTRACT = void 0;
exports.DAO_FT_CONTRACT = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ft-dao";
exports.DAO_FT_NAME = "get-name";
exports.DAO_FT_SYMBOL = "get-symbol";
exports.DAO_FT_DECIMALS = "get-decimals";
exports.DAO_FT_SUPPLY = "get-total-supply";
exports.DAO_FT_URI = "get-token-uri";
exports.DAO_FT_GET_PROPOSAL = "get-proposal";
exports.DAO_FT_IS_PROPOSAL_SUCCEEDED = "is-proposal-succeeded";
exports.DAO_FT_MINT = "mint";
exports.DAO_FT_CREATE_PROPOSAL = "create-proposal";
exports.DAO_FT_VOTE_PROPOSAL = "vote-proposal";
exports.devnet = process.env.NODE_ENV === "development";
exports.STACKS_API_URL = exports.devnet
    ? "http://localhost:3999"
    : "https://stacks-node-api.testnet.stacks.co";
