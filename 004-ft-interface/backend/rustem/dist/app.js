"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("./common/logger");
const contract_calls_1 = require("./common/contract-calls");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, rsp) => {
    rsp.send("Fungible Tokens for DAO!");
});
app.get("/contractAPI/tokenName", async (req, rsp) => {
    try {
        const name = await (0, contract_calls_1.getTokenName)();
        rsp.send(name);
    }
    catch (error) {
        rsp.status(404);
        rsp.send("Not Found - " + error);
    }
});
app.get("/contractAPI/tokenSymbol", async (req, rsp) => {
    try {
        const symbol = await (0, contract_calls_1.getTokenSymbol)();
        rsp.send(symbol);
    }
    catch (error) {
        rsp.status(404);
        rsp.send("Not Found - " + error);
    }
});
app.get("/contractAPI/tokenDecimals", async (req, rsp) => {
    try {
        const decimals = await (0, contract_calls_1.getTokenDecimals)();
        rsp.send(decimals);
    }
    catch (error) {
        rsp.status(404);
        rsp.send("Not Found - " + error);
    }
});
app.get("/contractAPI/tokenSupply", async (req, rsp) => {
    try {
        const tokenSupply = await (0, contract_calls_1.getTokenSupply)();
        rsp.send(tokenSupply);
    }
    catch (error) {
        rsp.status(404);
        rsp.send("Not Found - " + error);
    }
});
app.get("/contractAPI/tokenURI", async (req, rsp) => {
    try {
        const uri = await (0, contract_calls_1.getTokenURI)();
        rsp.send(uri);
    }
    catch (error) {
        rsp.status(404);
        rsp.send("Not Found - " + error);
    }
});
app.post("/contractAPI/setMnemonic", (req, rsp) => {
    const ret = (0, contract_calls_1.setMnemonic)(req.body.mnemonic);
    rsp.send(ret);
});
app.get("/getProposal", async (req, rsp) => {
    const val = await (0, contract_calls_1.getProposal)(req);
    rsp.send(val);
});
app.get("/isProposalSucceeded", async (req, rsp) => {
    const val = await (0, contract_calls_1.isProposalSucceeded)(req);
    rsp.send(val);
});
app.get("/mintFT", async (req, rsp) => {
    const val = await (0, contract_calls_1.mintFT)(req);
    rsp.send(val);
});
app.get("/createProposal", async (req, rsp) => {
    const val = await (0, contract_calls_1.createProposal)(req);
    rsp.send(val);
});
app.get("/voteProposal", async (req, rsp) => {
    const val = await (0, contract_calls_1.voteProposal)(req);
    rsp.send(val);
});
app.listen(3000, () => {
    logger_1.logger.info("listening on port 3000...");
});
