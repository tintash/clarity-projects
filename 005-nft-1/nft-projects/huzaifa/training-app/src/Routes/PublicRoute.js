import { Redirect, Route } from 'react-router-dom';

/**
 * Checks if currently a user exists. If no, then route
 * to the LogInSignUpPage else route to '/home' route
 */
function PublicRoute({ component: Component, connected, ...otherProps }) {
  return (
    <Route
      {...otherProps}
      component={() => (connected ? <Redirect to="/home" /> : <Component />)}
    />
  );
}

export default PublicRoute;
