import React, {Component, Fragment} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';

import routes from 'globals/routes';
import {library} from '@fortawesome/fontawesome-svg-core'
// import {faArrowsAlt, faArrowsAlt} from '@fortawesome/free-solid-svg-icons'

import {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';

import asyncLoadingComponent from 'components/asyncLoadingComponent';

// import EditorPage from 'pages/aframeEditor/editorPage';
// import PresenterPage from 'pages/aframeEditor/presenterPage';

import './App.css';

const faIconsNeed = [
  "faArrowsAlt",
  "faSyncAlt",
  "faExpandArrowsAlt",
  "faPlay",
  "faTrashAlt",
  "faEye",
  "faEyeSlash"
];

faIconsNeed.forEach(iconName => {
  const icon = require("@fortawesome/free-solid-svg-icons")[iconName];
  library.add(icon);
});

// delete any cached temp project files
try {
  fileSystem.myDeleteSync(appDirectory.appTempProjectsDirectory);
} catch (err) {
  console.error(err);
  alert(err);
}

// create App Data directories if they do not exist
Object.keys(appDirectory).forEach((appDirectoryKey) => {  
  fileSystem.createDirectoryIfNotExistsSync(appDirectory[appDirectoryKey]);
});

/* Note: Using async to load editor page causes some undesirable effects, hence not used. */
// Code Splitting and React Router v4
// https://serverless-stack.com/chapters/code-splitting-in-create-react-app.html
const EditorPage = require('pages/aframeEditor/editorPage').default;
const PresenterPage = require('pages/aframeEditor/presenterPage').default;
// const ViewerPage = require('pages/aframeEditor/viewerPage').default;
// const AsyncEditorPage = asyncLoadingComponent(() => import('pages/aframeEditor/editorPage'));
// const AsyncPresenterPage = asyncLoadingComponent(() => import('pages/aframeEditor/presenterPage'));
//const AsyncTestSaveLoad = asyncLoadingComponent(() => import('pages/TestSaveLoad'));
const AsyncTestFileExplorer = asyncLoadingComponent(() => import('pages/TestFileExplorer/TestFileExplorer'));

class App extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
  }
  render() {    
    return (
      <Fragment>
        {/* <div className="window-resizer border-left"></div>
        <div className="window-resizer border-right"></div>
        <div className="window-resizer border-top"></div>
        <div className="window-resizer border-bottom"></div>
        <div className="window-resizer corner-top-left"></div>
        <div className="window-resizer corner-top-right"></div>
        <div className="window-resizer corner-bottom-left"></div>
        <div className="window-resizer corner-bottom-right"></div> */}
        <div id="App">
          <Switch>
            <Route exact path="/file-explorer" render={() => <AsyncTestFileExplorer />} />
            <Route exact path={routes.editor} component={EditorPage} />
            {/* <Route exact path={routes.presenter} render={() => <AsyncPresenterPage />} /> */}
            <Route exact path={routes.presenter} component={PresenterPage} />
            {/* <Route exact path={routes.viewer} component={ViewerPage} /> */}
            <Redirect to={routes.editor} />
          </Switch>
        </div>
      </Fragment>
    );
  }
}

export default App;
