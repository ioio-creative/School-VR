import { openFileDialogFilter } from 'globals/config';


const electron = window.require('electron');
const { BrowserWindow, dialog } = electron.remote;


// https://electronjs.org/docs/api/dialog
// The browserWindow argument allows the dialog to attach itself to a parent window, making it modal.


function openDialogCommon(fileFilters, dialogMessage, callBack) {
  const browserWindow = BrowserWindow.getFocusedWindow();
  const optionsObj = {
    title: "Open",
    defaultPath: null,
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


export {
  openImageDialog,
  openGifDialog,
  openVideoDialog
};
