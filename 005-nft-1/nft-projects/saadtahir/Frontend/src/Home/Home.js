import React, { useState } from "react";
import { AppConfig, UserSession } from "@stacks/connect";
import "./Home.css";
import { Claim, GetLastTokenId, GetTotalTokens } from "../Velocity/Velocity";
import { useHistory } from "react-router-dom";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function Home(props) {
  const state = props.location.state;
  const [freeTokens, setFreeTokens] = useState(0);

  const handleFreeTokens = (tokenVal) => {
    setFreeTokens(tokenVal);
  };
  const handleLogout = () => {
    userSession.signUserOut("/");
  };

  return (
    <div>
      <h1>Welcome</h1>
      <h4>Testnet: {state.testnet}</h4>
      <h4>Mainnet: {state.mainnet}</h4>
      <button className="logout" onClick={handleLogout}>
        Logout
      </button>
      <GetLastTokenId handleFreeTokens={handleFreeTokens} />
      <Claim freeTokens={freeTokens} />
      <br />
      <SellTokens />
      <br />
      <BuyTokens />
      <GetTotalTokens />
    </div>
  );
}

function SellTokens() {
  let history = useHistory();

  const handleSale = () => {
    history.push("/sell-token");
  };
  return (
    <div>
      <button className="sell" onClick={handleSale}>
        Sell Tokens
      </button>
    </div>
  );
}

function BuyTokens() {
  let history = useHistory();

  const handleBuy = () => {
    history.push("/buy-token");
  };
  return (
    <button className="buy" onClick={handleBuy}>
      Buy Tokens
    </button>
  );
}

export default Home;
