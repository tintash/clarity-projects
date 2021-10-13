import { Switch } from 'react-router-dom';
import { userSession } from './auth';

import ConnectPage from './pages/connectPage/ConnectPage';
import HomePage from './pages/homePage/HomePage';
import ProfilePage from './pages/profilePage/ProfilePage';
import SellingPage from './pages/sellingPage/SellingPage';
import BuyingPage from './pages/buying-page/BuyingPage';
import PrivateRoute from './Routes/PrivateRoute';
import PublicRoute from './Routes/PublicRoute';
import './App.scss';

function App() {
  return (
    <div>
      <Switch>
        <PublicRoute
          exact
          path="/"
          connected={userSession.isUserSignedIn()}
          component={ConnectPage}
        />
        <PrivateRoute
          path="/home"
          connected={userSession.isUserSignedIn()}
          component={HomePage}
        />
        <PrivateRoute
          path="/profile"
          connected={userSession.isUserSignedIn()}
          component={ProfilePage}
        />
        <PrivateRoute
          path="/sell"
          connected={userSession.isUserSignedIn()}
          component={SellingPage}
        />
        <PrivateRoute
          path="/buy"
          connected={userSession.isUserSignedIn()}
          component={BuyingPage}
        />
      </Switch>
    </div>
  );
}

export default App;
