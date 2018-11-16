import React, {Component, Fragment} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';

import routes from 'globals/aframeEditor/routes';
import EditorPage from 'pages/aframeEditor/editorPage';
import PresenterPage from 'pages/aframeEditor/presenterPage';
import {library} from '@fortawesome/fontawesome-svg-core'
// import {faArrowsAlt, faArrowsAlt} from '@fortawesome/free-solid-svg-icons'

//import TestSaveLoad from 'pages/TestSaveLoad';
import TestFileExplorer from 'pages/TestFileExplorer/TestFileExplorer';

import config from 'globals/config';
import fileSystem from 'utils/fileSystem';

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

// create App Data directories if they do not exist
fileSystem.createDirectoryIfNotExistsSync(config.appDataDirectory);
fileSystem.createDirectoryIfNotExistsSync(config.appTempWorkingDirectory);

class App extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
  }
  render() {    
    return (
      <Fragment>
        <div className="window-resizer border-left"></div>
        <div className="window-resizer border-right"></div>
        <div className="window-resizer border-top"></div>
        <div className="window-resizer border-bottom"></div>
        <div className="window-resizer corner-top-left"></div>
        <div className="window-resizer corner-top-right"></div>
        <div className="window-resizer corner-bottom-left"></div>
        <div className="window-resizer corner-bottom-right"></div>
        <div id="App">
          <Switch>
            <Route exact path="/file-explorer" component={TestFileExplorer} />
            <Route exact path={routes.editor} component={EditorPage} />
            <Route exact path={routes.presenter} component={PresenterPage} />
            <Redirect to={routes.editor} />
          </Switch>
        </div>
      </Fragment>
    );
  }
}

export default App;
