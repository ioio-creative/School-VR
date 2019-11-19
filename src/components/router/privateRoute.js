import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import smalltalk from 'smalltalk';

import {getLocalizedDataSet} from 'globals/contexts/locale/languageContext';

//import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import {authenticateWithLicenseKeyPromise, getIsAuthenticated} from 'utils/authentication/auth';


// https://tylermcginnis.com/react-router-protected-routes-authentication/
class PrivateRoute extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: getIsAuthenticated(),
      isLicenseKeyInputPrompted: false
    };

    [
      'routeRenderFunctionWithRedirectFactory',
      'routeRenderFunctionWithLoadingFactory'
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  async componentDidMount() {
    console.log('PrivateRoute componentDidMount');
    const {
      isAuthenticated, isLicenseKeyInputPrompted
    } = this.state;
    if (!isAuthenticated && !isLicenseKeyInputPrompted) {
      const localizedDataSet = getLocalizedDataSet();
      const throwAuthenticationError = _ => { throw new Error('Authentication failed.'); };
      try {
        /**
         * Important:
         * if 'cancel' button is pressed, an error will be thrown ?
         */
        const newLicenseKeyEntered = await smalltalk.prompt(localizedDataSet['Prompt.AutenticationFailTitle'], localizedDataSet['Prompt.AutenticationFailMessage'], '');
        if (newLicenseKeyEntered) {
          const newIsAuthenticated = await authenticateWithLicenseKeyPromise(newLicenseKeyEntered);

          if (newIsAuthenticated) {
            alert(localizedDataSet['Alert.AutenticationSuccessMessage']);
            this.setState({
              isAuthenticated: newIsAuthenticated,
              isLicenseKeyInputPrompted: true
            });
          } else {
            throwAuthenticationError();
          }
        } else {
          throwAuthenticationError();
        }
      } catch (err) {
        alert(localizedDataSet['Alert.AutenticationFailMessage']);
        this.setState({
          isLicenseKeyInputPrompted: true
        });

        // silence error
        //handleErrorWithUiDefault(err);
      }
    }
  }

  componentWillUnmount() {
    console.log('PrivateRoute componentWillUnmount');
  }

  routeRenderFunctionWithRedirectFactory() {
    const {
      component: Component, fallBackRedirectPath
    } = this.props;
    const {
      isAuthenticated
    } = this.state;

    if (isAuthenticated === true) {
      return (someProps) => <Component {...someProps} />;
    } else {
      return (someProps) => <Redirect to={fallBackRedirectPath} />;
    }
  }

  // This allows time for prompting for license key input in componentDidMount().
  // Using routeRenderFunctionWithRedirectFactory on 1st render may result in <Redirect />,
  // which triggers route change, and hence PrivateRoute component to br unmounted straight away.
  routeRenderFunctionWithLoadingFactory() {
    const {
      component: Component
    } = this.props;
    const {
      isAuthenticated
    } = this.state;

    if (isAuthenticated === true) {
      return (someProps) => <Component {...someProps} />;
    } else {
      return (someProps) => <div>Loading...</div>;
    }
  }

  render() {
    const {
      component: Component, fallBackRedirectPath, ...rest
    } = this.props;
    const {
      isLicenseKeyInputPrompted
    } = this.state;
    const routeRenderFunction = !isLicenseKeyInputPrompted ?
      this.routeRenderFunctionWithLoadingFactory() : this.routeRenderFunctionWithRedirectFactory();
    return (
      <Route {...rest} render={routeRenderFunction} />
    );
  }
}


export default PrivateRoute;