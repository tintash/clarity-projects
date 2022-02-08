import express from "express";
import { logger } from "./common/logger";
import {
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  getTokenSupply,
  getTokenURI,
  getProposal,
  isProposalSucceeded,
  setMnemonic,
  mintFT,
  createProposal,
  voteProposal
} from "./common/contract-calls";

const app = express();
app.use(express.json());

app.get("/", (req, rsp) => {
  rsp.send("Fungible Tokens for DAO!");
});

const pathFunctionMap = {
  "tokenName": getTokenName,
  "tokenSymbol": getTokenSymbol,
  "tokenDecimals": getTokenDecimals,
  "tokenSupply": getTokenSupply,
  "tokenURI": getTokenURI,

};

app.get("/contractAPI/:path", async (req, rsp) => {
  try {
    const name = await pathFunctionMap[req.params.path]();
    rsp.send(name);
  } catch (error) {
    rsp.status(404);
    rsp.send("Not Found - " + error);
  }
});

app.post("/contractAPI/setMnemonic", (req, rsp) => {
  const ret = setMnemonic(req.body.mnemonic);
  rsp.send(ret);
});

app.get("/getProposal", async (req, rsp) => {
  const val = await getProposal(req);
  rsp.send(val);
});

app.get("/isProposalSucceeded", async (req, rsp) => {
  const val = await isProposalSucceeded(req);
  rsp.send(val);
});

app.post("/mintFT", async (req, rsp) => {
  const val = await mintFT(req);
  rsp.send(val);
});

app.post("/createProposal", async (req, rsp) => {
  const val = await createProposal(req);
  rsp.send(val);
});

app.post("/voteProposal", async (req, rsp) => {
  const val = await voteProposal(req);
  rsp.send(val);
});

app.listen(3000, () => {
  logger.info("listening on port 3000...");
});
