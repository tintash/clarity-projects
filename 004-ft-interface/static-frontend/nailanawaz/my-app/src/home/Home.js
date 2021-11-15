import { openContractCall } from '@stacks/connect';
import {
    standardPrincipalCV,
    callReadOnlyFunction
} from '@stacks/transactions';
import { StacksTestnet } from "@stacks/network";
import React, {
    useState } from "react";

import './Home.css';
import * as constants from '../utils/constants'

function Home(props) {
    const testnet = new StacksTestnet();
    const wallet = props.location.state;
   
    // Register
    const [regTxId, setRegTxId] = useState("");
    const [showRegSuccess, setShowRegSuccess] = useState("");

    // Play
    const [playTxId, setPlayTxId] = useState("");
    const [showPlaySuccess, setShowPlaySuccess] = useState("");

    // Balance
    const [balance, setBalance] = useState("");
    const [showBalanceSuccess, setShowBalanceSuccess] = useState("");

    // Register
    const register = async() => {
        var opt = createOptions(constants.registerUserFunction, [standardPrincipalCV(wallet.testnet)]);
        await openContractCall(opt);
    }
    
    // Play
    const play = async() => {
        var opt = createOptions(constants.playGameFunction, []);
        await openContractCall(opt);
    }

    // Balance
    const getBalance = async() => {
        console.log("here");
        var opt = createReadOnlyOptions(constants.getBalanceFunction, [standardPrincipalCV(wallet.testnet)]);
        console.log(opt);
        try {
            const result = await callReadOnlyFunction(opt);
            recordTx(constants.getBalanceFunction, result.value.value);
        }
        catch (err) {
            console.log("error: "  + err);
        }
    }

    const recordTx = (funcName, tx) => {
        switch (funcName) {
            case constants.registerUserFunction:
                setShowRegSuccess(true);
                setRegTxId(tx)
                break;

            case constants.playGameFunction:
                setPlayTxId(tx);
                setShowPlaySuccess(true);

            case constants.getBalanceFunction:
                setShowBalanceSuccess(true);
                setBalance(tx);
           
            default:
                return;
        }
        
    }

    const createOptions = (fncName, fncArgs) => {
        return {
            contractAddress: constants.contractAddress,
            contractName: constants.contractName,
            functionName: fncName,
            functionArgs: fncArgs,
            appDetails: {
            name: 'My App',
            icon: window.location.origin + '/my-app-logo.svg',
            },
            network:testnet,
            onFinish: data => {
                console.log('Stacks Transaction:', data.stacksTransaction);
                console.log('Transaction ID:', data.txId);
                console.log('Raw transaction:', data.txRaw);
                recordTx (fncName, data.txId)
            },
        }
    }

    const createReadOnlyOptions = (fncName, fncArgs) => {
        return {
            contractAddress: constants.contractAddress,
            contractName: constants.contractName,
            functionName: fncName,
            functionArgs: fncArgs,
            network: testnet,
            senderAddress: wallet.testnet
        }
    }
      
    return (
        <div className="Home">
            <div className="header"> 
                Welcome to FT Game. 
            </div>

            <div>
                <div>
                    TestNet: {wallet.testnet}
                </div>
                <b/>
                <div>
                    Mainnet: {wallet.mainnet}
                </div>
            </div>
            
            <div className="Title">
                PLAY GAME 
            </div>
            <div>
                <div className="div">

                    <button className="btn" onClick={register}>Register</button>

                    {showRegSuccess && (
                        <div className="div">
                            <input className="tx"
                                name="txRegister"
                                type="text"
                                value={regTxId}
                                onChange={recordTx}
                                placeholder="Transaction id will appear here"
                                />
                            
                            <div className="success-msg">
                                <label className='success-msg'> Registeration Successfull</label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="div">

                    <button className="btn" onClick={play}>Play Game</button>

                    {showPlaySuccess && (
                        <div className="div">
                            <input className="tx"
                                name="txPlay"
                                type="text"
                                value={playTxId}
                                onChange={recordTx}
                                placeholder="Transaction id will appear here"
                                />
                            
                            <div className="success-msg">
                                <label className='success-msg'> Check win status from TX Id</label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="div">

                    <button className="btn" onClick={getBalance}>Get Balance</button>

                    {showBalanceSuccess && (
                        <div className="div">
                            <input className="tx"
                                name="txBalance"
                                type="text"
                                value={balance}
                                onChange={recordTx}
                                placeholder="Balance will appear here"
                                />
                            
                            <div className="success-msg">
                                <label className='success-msg'> Balance Fetched Successfully</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
           
        </div>
    );
}

export default Home;
