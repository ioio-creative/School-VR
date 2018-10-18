import React, { Component } from 'react';

import IPCKeys from 'globals/ipcKeys';

const electron = window.require('electron');
const ipc = electron.ipcRenderer;
const dialog = electron.remote.dialog;


class TestSaveLoad extends Component {
  constructor(props) {
    super(props);
    this.actualFileTxt = React.createRef();
    this.contentEditorTxt = React.createRef();
  }

  /* event handlers */

  handleSelectFileClick() {
    dialog.showOpenDialog(function (fileNames) {
      if (fileNames === undefined) {
        console.log("No file selected");
      } else {
        this.actualFileTxt.value = fileNames[0];        
        ipc.send(IPCKeys.FileRead, fileNames[0]);
      }
    });
  }

  handleSaveChangesClick() {
    const actualFilePath = this.actualFileTxt.value;
    if (actualFilePath) {      
      ipc.send(IPCKeys.FileSaveChanges, actualFilePath, this.contentEditorTxt.value);
    } else {
      alert("Please select a file first");
    }
  }

  handleDeleteFileClick() {
    const actualFilePath = this.actualFileTxt.value;

    if (actualFilePath) {      
      ipc.send(IPCKeys.FileDelete, actualFilePath);
      this.actualFileTxt.value = "";
      this.contentEditorTxt.value = "";
    } else {
      alert("Please select a file first");
    }
  }

  handleCreateNewFileClick() {
    const content = this.contentEditorTxt.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) {
        console.log("You didn't save the file");
        return;
      }

      const errCallBack = (err) => {
        if (err) {
          alert("An error ocurred creating the file " + err.message)
        }
        alert("The file has been succesfully saved");
      };
      ipc.send(IPCKeys.FileWrite, fileName, content, errCallBack);
    });
  }

  /* end of event handlers */

  render() {
    return (
      <div>
        <div>
          <div style="text-align: center;">
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
        <div style="text-align: center;">
            <p>
                The file content will be the same as the editor.
            </p>
            <input type="button" value="Choose a file" id="create-new-file"
              onClick={this.handleCreateNewFileClick} 
            />
        </div>
      </div>
    );
  }
}

export default TestSaveLoad;
