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
  showConnect({
    appDetails: {
      name: "My App",
      icon: window.location.origin + logo,
    },
    redirectTo: "/",
    onFinish: onFinish,
    userSession: userSession,
  });
}

function onFinish() {
  const userData = userSession.loadUserData();
  // Save or otherwise utilize userData post-authentication
  const profile = userData.profile.stxAddress;
  const testnet = profile.testnet;
  const mainnet = profile.mainnet;
  document.getElementById("testnet").innerHTML = "Testnet: " + testnet;
  document.getElementById("mainnet").innerHTML = "Mainnet: " + mainnet;
  StoreData(userData);
}

function StoreData(data) {
  let fileUrl = storage
    .putFile(fileName, JSON.stringify(data), options)
    .then(() => {
      // Handle any execution after data has been saved
      console.log("Data Saved");
    });
  console.log(fileUrl);
}

function RetrieveData() {
  storage.getFile(fileName, options).then((fileData) => {
    console.log(fileData);
  });
}

export { RetrieveData, DoAuthenticate };
