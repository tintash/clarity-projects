import "./App.css";
import { DoAuthenticate, RetrieveData } from "./Authentication";
import {
  AddManagerContract,
  PublicContractCall,
  ReadOnlyContractCall,
  TransferToken,
} from "./Contract";
import TransferSTX from "./TransferSTX";

function App() {
  return (
    <div className="App">
      <h1> This is My App</h1>
      <DoAuthenticate />
      <br />
      <AddManagerContract />
      <br />
      <TransferSTX />
      <br />
      <PublicContractCall />
      <br />
      <ReadOnlyContractCall />
      <br />
      <TransferToken />
      <br />
      <button className="button" onClick={RetrieveData}>
        Retrieve Data
      </button>
      <br />
    </div>
  );
}

export default App;
