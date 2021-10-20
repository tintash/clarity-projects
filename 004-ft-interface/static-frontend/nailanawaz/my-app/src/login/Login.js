import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

import logo from '../logo.svg';
import './Login.css';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function Login() {
    const history = useHistory();
    const [testnet, setTestnet] = useState("")
    const [mainnet, setMainnet] = useState("");

    const handleLogin = () => {
        showConnect({
        appDetails: {
            name: "FT Game",
            icon: window.location.origin + logo,
        },
        onFinish: () => {
            redirectToHome();
        },
        userSession: userSession,
        });
    };

    const redirectToHome = () => {
        const userData = userSession.loadUserData();
        const profile = userData.profile.stxAddress;
        setTestnet(profile.testnet);
        setMainnet(profile.mainnet);
    }

    useEffect(() => {
        if (testnet && mainnet) {
            history.push('/home', { testnet: testnet, mainnet: mainnet } );
        }
      }, [testnet, mainnet, history]);

    return(
        <div className="Login">
            <div className="login-header">
                Welcome to FT Game. Login to Procede.
            </div>
            <button className="login-btn" onClick={handleLogin} >
                LOGIN
            </button>
        </div>
    ) 
}

export default Login;
