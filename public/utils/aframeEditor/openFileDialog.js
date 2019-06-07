const { appDirectory, openFileDialogFilter } = require('../../globals/config');
const { BrowserWindow, dialog } = require('electron');


const DialogType = {
  Open: "Open",
  Save: "Save"
};


// https://electronjs.org/docs/api/dialog
// The browserWindow argument allows the dialog to attach itself to a parent window, making it modal.
function showDialogCommon(fileFilters, dialogMessage, callBack, defaultPath, dialogType = DialogType.Open) {
  const browserWindow = BrowserWindow.getFocusedWindow();
    
  let dialogTitle = '';
  let dialogFuncToCall = _ => {};  
  switch (dialogType) {    
    case DialogType.Save:
      dialogTitle = 'Save';
      dialogFuncToCall = dialog.showSaveDialog;
      break;
    case DialogType.Open:      
    default:
      dialogTitle = 'Open';
      dialogFuncToCall = dialog.showOpenDialog;
      break;
  }

  const optionsObj = {
    title: dialogTitle,
    defaultPath: defaultPath,
    filters: fileFilters,
    properties: [
      'openFile'
    ],
    message: dialogMessage
  };

  dialogFuncToCall(browserWindow, optionsObj, (data) => {
    callBack(data);
  });
}

function openImageDialog(callBack) {
  console.log(['openImageDialog', openFileDialogFilter.image]);
  showDialogCommon([openFileDialogFilter.image],
    "Please select an image file.", callBack, DialogType.Open);  
}

function openGifDialog(callBack) {
  showDialogCommon([openFileDialogFilter.gif],
    "Please select a gif file.", callBack);  
}

function openVideoDialog(callBack) {
  console.log(['openVideoDialog', openFileDialogFilter.video]);
  showDialogCommon([openFileDialogFilter.video],
    "Please select a video file.", callBack, DialogType.Open);
}

function openSchoolVrFileDialog(callBack) {  
  showDialogCommon([openFileDialogFilter.schoolVrFile],
    "Please select a School VR file.", callBack,
    appDirectory.appProjectsDirectory, DialogType.Open);
}

function saveSchoolVrFileDialog(callBack) {
  showDialogCommon([openFileDialogFilter.schoolVrFile],
    "Please select a School VR file.", callBack,
    appDirectory.appProjectsDirectory, DialogType.Save);
}

module.exports = {
  openImageDialog,
  openGifDialog,
  openVideoDialog,
  openSchoolVrFileDialog,
  saveSchoolVrFileDialog
};
