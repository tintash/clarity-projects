import React from "react";
import { AppConfig, UserSession } from "@stacks/connect";
import "./Home.css";
import { ClaimForFree, GetLastTokenId } from "../Velocity/Velocity";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function Home(props) {
  const state = props.location.state;

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
      <GetLastTokenId />
      <ClaimForFree />
    </div>
  );
}

export default Home;
