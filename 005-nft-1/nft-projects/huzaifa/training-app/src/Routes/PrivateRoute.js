import { Redirect, Route } from 'react-router-dom';

/**
 * Checks if currently a user exists. If yes, then route
 * to the Homepage else route to '/' route
 */
function PrivateRoute({ component: Component, connected, ...otherProps }) {
  return (
    <Route
      component={() => (connected ? <Component /> : <Redirect to="/" />)}
      {...otherProps}
    />
  );
}

export default PrivateRoute;
