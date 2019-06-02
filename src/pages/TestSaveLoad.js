// https://ourcodeworld.com/articles/read/106/how-to-choose-read-save-delete-or-create-a-file-with-electron-framework

import React, { Component } from 'react';

import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import ipcHelper from 'utils/ipc/ipcHelper';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';


class TestSaveLoad extends Component {
  constructor(props) {
    super(props);
    this.actualFileTxt = React.createRef();
    this.contentEditorTxt = React.createRef();

    this.handleSelectFileClick = this.handleSelectFileClick.bind(this);
    this.handleSaveChangesClick = this.handleSaveChangesClick.bind(this);
    this.handleDeleteFileClick = this.handleDeleteFileClick.bind(this);
    this.handleCreateNewFileClick = this.handleCreateNewFileClick.bind(this);
  }

  /* event handlers */

  handleSelectFileClick() {
    ipcHelper.showOpenDialog(null, (err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const filePaths = data.filePaths;

      if (!isNonEmptyArray(filePaths)) {
        console.log("No file selected");
      } else {
        this.actualFileTxt.current.value = filePaths[0];
        const self = this;
        const callBack = function(err, data) {
          if (err) {
            handleErrorWithUiDefault(err);
            return;
          }
      
          self.contentEditorTxt.current.value = data.content;
        };
        ipcHelper.readFile(filePaths[0], callBack);        
      }
    });
  }

  handleSaveChangesClick() {
    const actualFilePath = this.actualFileTxt.current.value;
    if (actualFilePath) {
      const callBack = (err) => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }
    
        alert("The file has been succesfully saved");
      }
      ipcHelper.writeFile(actualFilePath, this.contentEditorTxt.current.value, callBack);            
    } else {
      alert("Please select a file first");
    }
  }

  handleDeleteFileClick() {
    const actualFilePath = this.actualFileTxt.current.value;

    if (actualFilePath) {
      const callBack = (err) => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }
      };
      
      ipcHelper.deleteFile(actualFilePath, callBack);
      this.actualFileTxt.current.value = "";
      this.contentEditorTxt.current.value = "";
    } else {
      alert("Please select a file first");
    }
  }

  handleCreateNewFileClick() {
    const content = this.contentEditorTxt.current.value;

    ipcHelper.showSaveDialog((filePath) => {
      if (filePath === undefined) {
        console.log("You didn't save the file");
        return;
      }

      console.log(filePath);

      const callBack = (err) => {
        if (err) {
          handleErrorWithUiDefault(err);
        }
        alert("The file has been succesfully saved");
      };
      ipcHelper.writeFile(filePath, content, callBack);
    });
  }

  /* end of event handlers */

  render() {
    return (
      <div>
        <div>
          <div style={{textAlign: 'center'}}>
            <input type="text" placeholder="Please select a file" id="actual-file" disabled="disabled" 
              ref={this.actualFileTxt} />
            <input type="button" value="Choose a file" id="select-file" 
              onClick={this.handleSelectFileClick} />
          </div>
          <br /><br />
          <textarea id="content-editor" rows="5"
            ref={this.contentEditorTxt}
          />
          <br /><br />
          <input type="button" id="save-changes" value="Save changes"
            onClick={this.handleSaveChangesClick}
          />
          <input type="button" id="delete-file" value="Delete file"
            onClick={this.handleDeleteFileClick}
          />
        </div>
        <hr />
        <div style={{textAlign: 'center'}}>
          <p>
              The file content will be the same as the editor.
          </p>
          <input type="button" value="Save new file" id="create-new-file"
            onClick={this.handleCreateNewFileClick} 
          />
        </div>
      </div>
    );
  }
}

export default TestSaveLoad;
