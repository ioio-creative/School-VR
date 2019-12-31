import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';

import DefaultLoading from 'components/loading/defaultLoading';

import PrivateRoute from 'components/router/privateRoute';
import {authenticatePromise} from 'utils/authentication/auth';

import routes from 'globals/routes';
import {library} from '@fortawesome/fontawesome-svg-core'
// import {faArrowsAlt, faArrowsAlt} from '@fortawesome/free-solid-svg-icons'

import config, {setAppData, setParamsReadFromExternalConfig} from 'globals/config';
import ipcHelper from 'utils/ipc/ipcHelper';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import {getCustomizedAppDataPromise} from 'globals/customizedAppData/customizedAppData';

import asyncLoadingComponent from 'components/loading/asyncLoadingComponent';

// import EditorPage from 'pages/aframeEditor/editorPage';
// import PresenterPage from 'pages/aframeEditor/presenterPage';

import {SceneContextProvider} from 'globals/contexts/sceneContext';
import {changeGlobalLanguageByCodePromise, LanguageContextProvider} from 'globals/contexts/locale/languageContext';

import './App.css';


const faIconsNeed = [
  "faArrowsAlt",
  "faSyncAlt",
  "faExpandArrowsAlt",
  "faPlay",
  "faPause",
  "faTrashAlt",
  "faEye",
  "faEyeSlash",
  "faAngleLeft",
  "faAngleRight",
  "faVideo",
  "faVideoSlash",
  "faWindowMinimize",
  "faWindowMaximize",
  "faWindowRestore",
  "faWindowClose",
];

faIconsNeed.forEach(iconName => {
  const icon = require("@fortawesome/free-solid-svg-icons")[iconName];
  library.add(icon);
});


/* Note: Using async to load editor page causes some undesirable effects, hence not used. */
// Code Splitting and React Router v4
// https://serverless-stack.com/chapters/code-splitting-in-create-react-app.html
const ViewerPage = require('pages/aframeEditor/viewerPage').default;
const AsyncEditorPage = asyncLoadingComponent(_ => import('pages/aframeEditor/editorPage'));
const AsyncViewerPage = asyncLoadingComponent(_ => import('pages/aframeEditor/viewerPage'));
const AsyncPresenterPage = asyncLoadingComponent(_ => import('pages/aframeEditor/presenterPage'));
//const AsyncTestSaveLoad = asyncLoadingComponent(_ => import('pages/TestSaveLoad'));
const AsyncTestFileExplorer = asyncLoadingComponent(_ => import('pages/TestFileExplorer/TestFileExplorer'));
const AsyncProjectListPage = asyncLoadingComponent(_ => import('pages/ProjectListPage'));


class App extends Component {
  constructor(props) {
    super(props);

    this.isElectronApp = config.isElectronApp;
    console.log('isElectronApp:', this.isElectronApp);

    this.state = {
      isGotAppData: this.isElectronApp ? false : true,
      isGotParamsReadFromExternalConfig: this.isElectronApp ? false : true,
      isGotCustomizedAppData: this.isElectronApp ? false : true,
      isAuthenticationDone: false
    };
  }
  componentDidMount() {
    if (this.isElectronApp) {
      ipcHelper.getAppData((err, data) => {
        if (err) {
          this.setState({
            isGotAppData: true
          });
          handleErrorWithUiDefault(err);
          return;
        }

        setAppData(data);
        this.setState({
          isGotAppData: true
        });
      })

      ipcHelper.getParamsFromExternalConfig((err, data) => {
        if (err) {
          this.setState({
            isGotParamsReadFromExternalConfig: true
          });
          handleErrorWithUiDefault(err);
          return;
        }

        setParamsReadFromExternalConfig(data);
        this.setState({
          isGotParamsReadFromExternalConfig: true
        });
      });

      getCustomizedAppDataPromise()
        .then(async customizedAppData => {
          const langCodeToUse = (customizedAppData && customizedAppData.langCode) || config.defaultLanguage.code;
          console.log('langCodeToUse:', langCodeToUse);
          await changeGlobalLanguageByCodePromise(langCodeToUse, false);
        })
        .catch(handleErrorWithUiDefault)
        .finally(_ => {
          this.setState({
            isGotCustomizedAppData: true
          });
        })

      authenticatePromise()
        .then((isAuthenticated) => {
          console.log('isAuthenticated:', isAuthenticated);
        })
        .catch(handleErrorWithUiDefault)
        .finally(_ => {
          this.setState({
            isAuthenticationDone: true
          });
        });
    }
  }
  render() {
    const {
      isGotAppData,
      isGotParamsReadFromExternalConfig,
      isGotCustomizedAppData,
      isAuthenticationDone
    } = this.state;
    return !(isGotAppData && isGotParamsReadFromExternalConfig && isGotCustomizedAppData && isAuthenticationDone) ?
      <DefaultLoading />
      :
      (
        <LanguageContextProvider>
          <SceneContextProvider>
            <div id="App">
              {/* if !electron, return viewer page only */}
              {
                this.isElectronApp ?

                <Switch>                  
                  <PrivateRoute exact path="/file-explorer" component={AsyncTestFileExplorer} fallBackRedirectPath={routes.home} fallBackRedirectPath={routes.home} />
                  <PrivateRoute exact path={routes.editor} component={AsyncEditorPage} fallBackRedirectPath={routes.home} />
                  <PrivateRoute exact path={routes.presenter} component={AsyncPresenterPage} fallBackRedirectPath={routes.home} />
                  <PrivateRoute exact path={routes.viewer} component={ViewerPage} fallBackRedirectPath={routes.home} />
                  <PrivateRoute exact path={routes.projectList} component={AsyncProjectListPage} />
                  <Route exact path={routes.home} component={AsyncProjectListPage} />
                  <Redirect to={routes.home} />
                </Switch>

                :

                <Switch>
                  <Route exact path={routes.home} component={ViewerPage} />
                  <Redirect to={routes.home} />
                </Switch>
              }
            </div>
          </SceneContextProvider>
        </LanguageContextProvider>
      );
  }
}

export default App;
