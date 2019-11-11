import React from 'react';
import {Route, Redirect} from 'react-router-dom';

import {getIsAuthenticated} from 'utils/authentication/auth';

import {LanguageContextConsumer} from 'globals/contexts/languageContext';

const PrivateRoute = ({ component: Component, fallBackRedirectPath, ...rest }) => (
  <LanguageContextConsumer render={
    ({ messages }) => (
      <Route {...rest} render={(props) => {
        const isAuthenticated = getIsAuthenticated();
        if (!isAuthenticated) {
          alert(messages['Prompt.AutenticationFailMessage']);
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