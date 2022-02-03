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

app.get("/contractAPI/tokenName", async (req, rsp) => {
  try {
    const name = await getTokenName();
    rsp.send(name);
  } catch (error) {
    rsp.status(404);
    rsp.send("Not Found - " + error);
  }
});

app.get("/contractAPI/tokenSymbol", async (req, rsp) => {
  try {
    const symbol = await getTokenSymbol();
    rsp.send(symbol);
  } catch (error) {
    rsp.status(404);
    rsp.send("Not Found - " + error);
  }
});

app.get("/contractAPI/tokenDecimals", async (req, rsp) => {
  try {
    const decimals = await getTokenDecimals();
    rsp.send(decimals);
  } catch (error) {
    rsp.status(404);
    rsp.send("Not Found - " + error);
  }
});

app.get("/contractAPI/tokenSupply", async (req, rsp) => {
  try {
    const tokenSupply = await getTokenSupply();
    rsp.send(tokenSupply);
  } catch (error) {
    rsp.status(404);
    rsp.send("Not Found - " + error);
  }
});

app.get("/contractAPI/tokenURI", async (req, rsp) => {
  try {
    const uri = await getTokenURI();
    rsp.send(uri);
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

app.get("/mintFT", async (req, rsp) => {
  const val = await mintFT(req);
  rsp.send(val);
});

app.get("/createProposal", async (req, rsp) => {
  const val = await createProposal(req);
  rsp.send(val);
});

app.get("/voteProposal", async (req, rsp) => {
  const val = await voteProposal(req);
  rsp.send(val);
});

app.listen(3000, () => {
  logger.info("listening on port 3000...");
});
