import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Authentication from "./Authentication/Authentication";
import Home from "./Home/Home";
import SellToken from "./Token/SellToken";
import BuyToken from "./Token/BuyToken.js";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Authentication} />
          <Route path="/home" component={Home} />
          <Route path="/sell-token" component={SellToken} />
          <Route path="/buy-token" component={BuyToken} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
