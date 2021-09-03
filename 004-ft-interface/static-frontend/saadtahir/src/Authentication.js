import React, { useState } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { Storage } from "@stacks/storage";
import logo from "./logo.svg";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
const storage = new Storage({ userSession });
let fileName = "userData.json";

const options = {
  encrypt: true,
};

function DoAuthenticate() {
  const [testnet, setTestnet] = useState("");
  const [mainnet, setMainnet] = useState("");

  const handleSubmit = (e) => {
    showConnect({
      appDetails: {
        name: "My App",
        icon: window.location.origin + logo,
      },
      redirectTo: "/",
      onFinish: onFinish,
      userSession: userSession,
    });
  };

  const onFinish = (e) => {
    const userData = userSession.loadUserData();
    const profile = userData.profile.stxAddress;
    setTestnet(profile.testnet);
    setMainnet(profile.mainnet);
  };

  return (
    <div>
      <h1 id="testnet">Testnet: {testnet}</h1>
      <h1 id="mainnet">Mainnet: {mainnet}</h1>
      <button className="button" onClick={handleSubmit}>
        Authenicate
      </button>
    </div>
  );
}

function StoreData(data) {
  let fileUrl = storage
    .putFile(fileName, JSON.stringify(data), options)
    .then(() => {
      // Handle any execution after data has been saved
      console.log("Data Saved");
    })
    .catch((err) => {
      console.log("Data not saved: " + err);
    });
  console.log(fileUrl);
}

function RetrieveData() {
  storage.getFile(fileName, options).then((fileData) => {
    console.log(fileData);
  });
}

export { RetrieveData, DoAuthenticate };
