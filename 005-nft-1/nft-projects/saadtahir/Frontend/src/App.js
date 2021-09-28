import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// import WithSpinner from "./with-spinner/WithSpinner";
import "./App.css";
import Authentication from "./Authentication/Authentication";
import Home from "./Home/Home";
import SellToken from "./Token/SellToken";
import BuyToken from "./Token/BuyToken.js";

// const HomeWithSpinner = WithSpinner(Home);

function App() {
  // const [loading, setLoading] = useState(true);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Authentication} />
          <Route path="/home" component={Home} />
          {/* <Route path="/home" component={(props) => (
            <HomeWithSpinner isLoading={loading} {...props} />
          )} /> */}
          <Route path="/sell-token" component={SellToken} />
          <Route path="/buy-token" component={BuyToken} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
