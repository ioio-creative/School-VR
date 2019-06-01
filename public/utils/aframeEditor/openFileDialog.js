const { appDirectory, openFileDialogFilter } = require('../../globals/config');

//const { BrowserWindow, dialog } = require('electron').remote;
const { BrowserWindow, dialog } = require('electron');

// https://electronjs.org/docs/api/dialog
// The browserWindow argument allows the dialog to attach itself to a parent window, making it modal.


function openDialogCommon(fileFilters, dialogMessage, callBack, defaultPath) {
  const browserWindow = BrowserWindow.getFocusedWindow();
  const optionsObj = {
    title: "Open",
    defaultPath: defaultPath,
    filters: fileFilters,
    properties: [
      'openFile'
    ],
    message: dialogMessage
  };
  dialog.showOpenDialog(browserWindow, optionsObj, (filePaths) => {
    callBack(filePaths);
  });
}

function openImageDialog(callBack) {
  openDialogCommon([openFileDialogFilter.image],
    "Please select an image file.", callBack);  
}

function openGifDialog(callBack) {
  openDialogCommon([openFileDialogFilter.gif],
    "Please select a gif file.", callBack);  
}

function openVideoDialog(callBack) {
  openDialogCommon([openFileDialogFilter.video],
    "Please select a video file.", callBack);
}

function openSchoolVrFileDialog(callBack) {  
  openDialogCommon([openFileDialogFilter.schoolVrFile],
    "Please select a School VR file.", callBack,
    appDirectory.appProjectsDirectory);
}


module.exports = {
  openImageDialog,
  openGifDialog,
  openVideoDialog,
  openSchoolVrFileDialog
};
