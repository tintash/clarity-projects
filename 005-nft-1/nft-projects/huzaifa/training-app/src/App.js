import { Switch } from 'react-router-dom';
import { userSession } from './auth';

import ConnectPage from './pages/connectPage/ConnectPage';
import HomePage from './pages/homePage/HomePage';
import PrivateRoute from './Routes/PrivateRoute';
import PublicRoute from './Routes/PublicRoute';
import './App.scss';

function App() {
  return (
    <div>
      <Switch>
        <PrivateRoute
          path="/home"
          connected={userSession.isUserSignedIn()}
          component={() => <HomePage />}
        />
        <PublicRoute
          exact
          path="/"
          connected={userSession.isUserSignedIn()}
          component={() => <ConnectPage />}
        />
      </Switch>
    </div>
  );
}

export default App;
