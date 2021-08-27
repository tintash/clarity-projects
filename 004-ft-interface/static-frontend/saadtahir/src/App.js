import "./App.css";
import { DoAuthenticate, RetrieveData } from "./Authentication";
import { PublicContractCall, ReadOnlyContractCall } from "./Contract";
import TransferSTX from "./TransferSTX";

function App() {
  return (
    <div className="App">
      <h1> This is My App</h1>
      <button className="button" onClick={DoAuthenticate}>
        Authenicate
      </button>
      <h1 id="testnet">Testnet</h1>
      <h1 id="mainnet">Mainnet</h1>
      <button className="button" onClick={TransferSTX}>
        Transfer 100 stx
      </button>
      <br />
      <button className="button" onClick={PublicContractCall}>
        Call Contract
      </button>
      <br />
      <button className="button" onClick={ReadOnlyContractCall}>
        Call Read Only function
      </button>
      <br />
      <button className="button" onClick={RetrieveData}>
        Retrieve Data
      </button>
      <br />
    </div>
  );
}

export default App;
