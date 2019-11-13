import React from 'react';
import {Route, Redirect} from 'react-router-dom';

import {getIsAuthenticated, getCurrentMacAddress} from 'utils/authentication/auth';

import {LanguageContextConsumer} from 'globals/contexts/languageContext';

const PrivateRoute = ({ component: Component, fallBackRedirectPath, ...rest }) => (
  <LanguageContextConsumer render={
    ({ messages }) => (
      <Route {...rest} render={(props) => {
        const isAuthenticated = getIsAuthenticated();
        if (!isAuthenticated) {
          const currentMacAddress = getCurrentMacAddress();
          alert(`${messages['Prompt.AutenticationFailMessage']}\nMAC: ${currentMacAddress}`);
        }
        return (
          isAuthenticated === true
            ? <Component {...props} />
            : <Redirect to={fallBackRedirectPath} />
        )
      }} />
    )
  } />
)

export default PrivateRoute;