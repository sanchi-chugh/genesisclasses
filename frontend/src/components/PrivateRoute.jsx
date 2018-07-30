import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({Child, authed, ...rest}) => {
  console.log(rest, Child, authed);
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Child {...props} />
        : <Redirect to={'/login/'} />}
    />
  )
}

export default PrivateRoute;