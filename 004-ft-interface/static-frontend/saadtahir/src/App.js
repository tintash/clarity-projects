import "./App.css";
import { DoAuthenticate, RetrieveData } from "./Authentication";
import ContractCall from "./Contract";
import TransferSTX from "./TransferSTX";

function App() {
  return (
    <div className="App">
      <h1> This is My App</h1>
      <br />
      <button onClick={DoAuthenticate}>Authenicate</button>
      <h1 id="testnet">Testnet</h1>
      <h1 id="mainnet">Mainnet</h1>
      <button onClick={TransferSTX}>Transfer 100 stx</button>
      <br />
      <button onClick={ContractCall}>Call Contract</button>
      <br />
      <button onClick={RetrieveData}>Retrieve Data</button>
      <br />
    </div>
  );
}

export default App;
