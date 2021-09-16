import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Authentication from "./Authentication/Authentication";
import Home from "./Home/Home";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Authentication} />
          <Route path="/home" component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
