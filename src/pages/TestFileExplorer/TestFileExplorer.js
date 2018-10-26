// https://github.com/hokein/electron-sample-apps/tree/master/file-explorer

import React, { Component } from 'react';

import AddressBar from 'pages/TestFileExplorer/AddressBar';
import FolderView from 'pages/TestFileExplorer/FolderView';

import config from 'globals/config';

const electron = window.require('electron');
const remote = electron.remote;
const { app, shell } = remote;

class TestFileExplorer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPath: config.appDataDirectory
    };
    
    this.handleAddressBarItemClick = this.handleAddressBarItemClick.bind(this);
    this.handleFolderItemClick = this.handleFolderItemClick.bind(this);
  }

  // set path for file explorer
  setPath(path) {
    if (path.indexOf('~') === 0) {
      // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
      path = path.replace('~', app.getPath('appData'));
    }
    this.folder.open(path);
    this.addressbar.set(path);
  }

  /* event handlers */

  handleAddressBarItemClick(dirPath) {
    this.setState({
      currentPath: dirPath
    });
  }

  handleFolderItemClick(dir, mime) {
    if (mime.type !== 'folder') {
      shell.openItem(mime.path);
    }
  }

  /* end of event handlers */


  render() {
    const state = this.state;
    return (
      <div style={{position: "absolute", left: "10px", right: "10px", top: "10px", bottom: "10px"}}>
        <div className="well" style={{float: "left", width: "160px", padding: "8px"}}>
          <ul className="nav nav-list" id="sidebar" ref={this.sidebarRef}>
            <li className="nav-header">Favorites</li>
            <li className="active">
              <a href="#"><i className="icon-white icon-home"></i> Home</a>
            </li>
          </ul>
        </div>

        <div style={{float: "left", position: "absolute", left: "210px", right: "0", top: "0", bottom: "50px"}}>
          <div className="row">
            <AddressBar
              currentPath={state.currentPath}
              handleAddressBarItemClickFunc={this.handleAddressBarItemClick}
            />
          </div>
          <div className="row" style={{background: "#FFF", WebkitBorderRadius: "2px", margin: "-5px 1px 0 -19px", height: "100%", overflow: "auto"}}>
            <FolderView
              currentPath={state.currentPath}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TestFileExplorer;