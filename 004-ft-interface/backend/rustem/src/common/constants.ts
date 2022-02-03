export const DAO_FT_CONTRACT =
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ft-dao";
export const DAO_FT_NAME = "get-name";
export const DAO_FT_SYMBOL = "get-symbol";
export const DAO_FT_DECIMALS = "get-decimals";
export const DAO_FT_SUPPLY = "get-total-supply";
export const DAO_FT_URI = "get-token-uri";

export const DAO_FT_GET_PROPOSAL = "get-proposal";
export const DAO_FT_IS_PROPOSAL_SUCCEEDED = "is-proposal-succeeded";
export const DAO_FT_MINT = "mint";
export const DAO_FT_CREATE_PROPOSAL = "create-proposal";
export const DAO_FT_VOTE_PROPOSAL = "vote-proposal";

export const devnet = process.env.NODE_ENV === "development";
export const STACKS_API_URL = devnet
  ? "http://localhost:3999"
  : "https://stacks-node-api.testnet.stacks.co";