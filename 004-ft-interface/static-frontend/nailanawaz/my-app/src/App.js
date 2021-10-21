import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import './App.css';
import Login from './login/Login';
import Home from './home/Home'

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/home" component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
