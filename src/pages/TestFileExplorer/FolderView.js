// https://github.com/hokein/electron-sample-apps/tree/master/file-explorer

import React, { Component } from 'react';

import mime from 'utils/mime';

import fileSystem from 'utils/fileSystem';
import { getAbsoluteUrlFromRelativeUrl } from 'utils/setStaticResourcesPath';

const path = window.require('path');


function FileItem(props) {  
  return (
    <div className="file"
      data-path={props.path}>
      <div className="icon">
        <img src={getAbsoluteUrlFromRelativeUrl(`fileExplorer/icons/${props.type}.png`)} />
        <div className="name">{props.name}</div>
      </div>
    </div>
  );
}

class FolderView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: []
    };

    this.handleFolderItemClick = this.handleFolderItemClick.bind(this);   
  }

  componentDidMount() {
    const props = this.props;
    fileSystem.readDirectory(props.currentPath, (error, files) => {
      if (error) {
        console.log(error);
        window.alert(error);
        return;
      }

      const customisedFiles = files.map((file) => {
        return mime.stat(path.join(props.currentPath, file))
      });

      this.setState({
        files: customisedFiles
      });
    });
  }

  /* event handlers */

  handleFolderItemClick(dir, mime) {
    if (mime.type === 'folder') {
      this.open(dir);
    }
  }

  /* end of event handlers */

  render() {
    const props = this.props;
    const state = this.state;

    if (state.files.length === 0) {
      return null;
    }

    const files = state.files.map((file) => {
      return (
        <FileItem key={file.path}
          name={file.name}
          type={file.type}
          path={file.path}
        />
      );
    });    

    return (
      <ul style={{margin: "5px"}} id="files">
        {files}
      </ul>
    );
  }
}

export default FolderView;