// https://github.com/hokein/electron-sample-apps/tree/master/file-explorer

import React, { Component } from 'react';

import AddressBar from 'pages/TestFileExplorer/AddressBar';
import FolderView from 'pages/TestFileExplorer/FolderView';

import config, { appDirectory } from 'globals/config';
import fileHelper from 'utils/fileHelper/fileHelper';
import ipcHelper from 'utils/ipcHelper';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';

import './bootstrap/css/bootstrap.css';
import './style.css';

const electron = window.require('electron');
const { BrowserWindow } = electron.remote;


let aboutWindow;

function FolderLink(props) {
  return (
    <li className={props.isActive ? "active" : ""}>
      <a href="#" 
        onClick={() => {                    
          props.handleClickFunc(props.dirPath, props.idx);
        }}>
        <i className={(props.isActive ? "icon-white " : "") + props.iconClass}></i>
        {props.folderName}
      </a>
    </li>
  );
}

class TestFileExplorer extends Component {
  constructor(props) {
    super(props);

    this.favouriteDirectories = [
      { name: "School VR", path: appDirectory.appDataDirectory, iconClass: "icon-home" },  
      { name: "Home", path: "~/", iconClass: "icon-home" },
      { name: "Documents", path: "~/Documents", iconClass: "icon-book" },
      { name: "Pictures", path: "~/Pictures", iconClass: "icon-picture" },
      { name: "Music", path: "~/Music", iconClass: "icon-music" },
      { name: "Movies", path: "~/Movies", iconClass: "icon-film" }
    ];
    
    this.state = {
      currentPath: appDirectory.appDataDirectory,
      activeFavouriteDirectoryIdx: 0
    };

    this.getAbsolutePathFromHome = this.getAbsolutePathFromHome.bind(this);    
    
    this.handleAddressBarItemClick = this.handleAddressBarItemClick.bind(this);
    this.handleFileItemClick = this.handleFileItemClick.bind(this);
    this.handleFavouriteDirectoryClick = this.handleFavouriteDirectoryClick.bind(this);
    this.handleAboutButtonClick = this.handleAboutButtonClick.bind(this);  
  }

  // set path for file explorer
  getAbsolutePathFromHome(path) {
    let absolutePath = path;
    if (path.indexOf('~') === 0) {      
      absolutePath = path.replace('~', appDirectory.homeDirectory);
    }
    return absolutePath;
  }

  /* event handlers */

  handleAddressBarItemClick(dirPath) {
    if (this.state.currentPath !== dirPath) {
      this.setState({
        currentPath: dirPath
      });
    }
  }

  handleFileItemClick(filePath, mime) {    
    if (mime.type === 'folder') {
      if (filePath.includes('progressive-texture-trial')) {  // test packaging
        const src = filePath;
        const dest = filePath + config.schoolVrProjectArchiveExtensionWithLeadingDot;

        ipcHelper.createPackage(src, dest, (err) => {
          if (err) {
            handleErrorWithUiDefault(err);
            return;
          }

          this.setState({
            // this shows the normalized version of the path ... , not what I want
            //currentPath: fileHelper.join(filePath, '..')
            currentPath: filePath + fileHelper.sep + '..'
          });
        });
      } else {
        if (this.state.currentPath !== filePath) {
          this.setState({
            currentPath: filePath
          });
        }
      }      
    } else if (filePath.includes(config.schoolVrProjectArchiveExtensionWithLeadingDot)) {  // test unpackaging
      const archive = filePath;
      const dest = fileHelper.join(config.appTempDirectory, fileHelper.getFileNameWithoutExtension(filePath));      
      ipcHelper.extractAll(archive, dest, (err) => {
        if (err) {
          handleErrorWithUiDefault(err);
        }
      });
    } else if (mime.type === 'image') {  // test base64 encode / decode
      ipcHelper.base64Encode(mime.path, (err, data) => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }
        
        const encodedStr = data.encodedStr;
        //console.log(encodedStr);
        const pathToSave = fileHelper.join(config.appDataDirectory, 'test_images', 'test1' + fileHelper.getFileExtensionWithLeadingDot(mime.path));
        //console.log(pathToSave);
        if (fileHelper.resolve(pathToSave) !== fileHelper.resolve(mime.path)) {
          ipcHelper.base64Decode(
            pathToSave,
            encodedStr,
            (err) => {
              if (err) {
                handleErrorWithUiDefault(err);
                return;
              }
            }
          );
        } else {
          ipcHelper.shellOpenItem(mime.path);      
        }        
      });      
    } else {      
      ipcHelper.shellOpenItem(mime.path);
    }
  }

  handleFavouriteDirectoryClick(dirPath, favouriteDirectoryIdx) {
    const newDirPath = this.getAbsolutePathFromHome(dirPath);    
    if (this.state.currentPath !== newDirPath) {
      this.setState({
        currentPath: newDirPath,
        activeFavouriteDirectoryIdx: favouriteDirectoryIdx
      });
    }
  }

  handleAboutButtonClick() {
    const options = {
      toolbar: false,
      //resizable: false,
      show: true,
      height: 600,
      width: 800
    };
    ipcHelper.newBrowserWindow(options, 'https://github.com/hokein/electron-sample-apps/tree/master/file-explorer',
      (err, data) => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }
        aboutWindow = data.newWindow;
      }
    );    
  }

  /* end of event handlers */

  render() {
    const state = this.state;
    const favouriteFolderItems = this.favouriteDirectories.map((directory, idx) => {
      return (
        <FolderLink key={directory.path} idx={idx}
          dirPath={directory.path}
          isActive={state.activeFavouriteDirectoryIdx === idx}
          iconClass={directory.iconClass}
          folderName={directory.name}
          handleClickFunc={this.handleFavouriteDirectoryClick}
        />
      );
    });
    return (
      <div style={{position: "absolute", left: "10px", right: "10px", top: "10px", bottom: "10px"}}>
        <div className="well" style={{float: "left", width: "160px", padding: "8px"}}>
          <ul className="nav nav-list" id="sidebar" ref={this.sidebarRef}>
            <li className="nav-header">Favorites</li>
            {favouriteFolderItems}
            <li className="nav-header">Network</li>
            <li className="divider"></li>
            <li>
              <a href="#" onClick={this.handleAboutButtonClick}>
                <i className="icon-flag"></i>
                About
              </a>
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
              handleFileItemClickFunc={this.handleFileItemClick}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TestFileExplorer;