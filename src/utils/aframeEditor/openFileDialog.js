import { openFileDialogFilter } from 'globals/config';


const electron = window.require('electron');
const { BrowserWindow, dialog } = electron.remote;


// https://electronjs.org/docs/api/dialog
// The browserWindow argument allows the dialog to attach itself to a parent window, making it modal.


function openImageDialog(callBack) {
  const browserWindow = BrowserWindow.getFocusedWindow();
  const optionsObj = {
    title: "Open",
    defaultPath: null,
    filters: [
      openFileDialogFilter.images
    ],
    properties: [
      'openFile'
    ],
    message: "Please select an image file."
  };
  dialog.showOpenDialog(browserWindow, optionsObj, (filePaths) => {
    callBack(filePaths);
  });
}

function openGifDialog(callBack) {
  const browserWindow = BrowserWindow.getFocusedWindow();
  const optionsObj = {
    title: "Open",
    defaultPath: null,
    filters: [
      openFileDialogFilter.images
    ],
    properties: [
      'openFile'
    ],
    message: "Please select an image file."
  };
  dialog.showOpenDialog(browserWindow, optionsObj, (filePaths) => {
    callBack(filePaths);
  });
}

function openVideoDialog(callBack) {
  const browserWindow = BrowserWindow.getFocusedWindow();
  const optionsObj = {
    title: "Open",
    defaultPath: null,
    filters: [
      openFileDialogFilter.videos
    ],
    properties: [
      'openFile'
    ],
    message: "Please select a video file."
  };
  dialog.showOpenDialog(browserWindow, optionsObj, (filePaths) => {
    callBack(filePaths);
  });
}


export {
  openImageDialog,
  openGifDialog,
  openVideoDialog
};
