import React, { Component } from 'react';

import IPCKeys from 'globals/ipcKeys';
import file from 'utils/file';

const electron = window.require('electron');
const ipc = electron.ipcRenderer;
const dialog = electron.remote.dialog;
const fs = window.require('fs');


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
    dialog.showOpenDialog((fileNames) => {
      if (fileNames === undefined) {
        console.log("No file selected");
      } else {
        this.actualFileTxt.current.value = fileNames[0];
        const self = this;
        const callBack = function(err, data) {
          if (err) {
            alert("An error ocurred reading the file :" + err.message);
            return;
          }
      
          self.contentEditorTxt.current.value = data;
        };
        file.readFile(fs, fileNames[0], callBack);
      }
    });
  }

  handleSaveChangesClick() {
    const actualFilePath = this.actualFileTxt.current.value;
    if (actualFilePath) {
      const callBack = (err) => {
        if (err) {
          alert("An error ocurred updating the file" + err.message);
          console.log(err);
          return;
        }
    
        alert("The file has been succesfully saved");
      }
      file.writeFile(fs, actualFilePath, this.contentEditorTxt.current.value, callBack);      
    } else {
      alert("Please select a file first");
    }
  }

  handleDeleteFileClick() {
    const actualFilePath = this.actualFileTxt.current.value;

    if (actualFilePath) {
      const callBack = (err) => {
        if (err) {
          alert("An error ocurred updating the file" + err.message);
          console.log(err);
          return;
        }
      };
      
      file.deleteFile(fs, actualFilePath, callBack);
      this.actualFileTxt.current.value = "";
      this.contentEditorTxt.current.value = "";
    } else {
      alert("Please select a file first");
    }
  }

  handleCreateNewFileClick() {
    const content = this.contentEditorTxt.current.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) {
        console.log("You didn't save the file");
        return;
      }

      const callBack = (err) => {
        if (err) {
          alert("An error ocurred creating the file " + err.message)
        }
        alert("The file has been succesfully saved");
      };
      file.writeFile(fs, fileName, content, callBack);
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
