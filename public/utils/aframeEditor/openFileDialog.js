const {
  config,
  appDirectory,
  openFileDialogFilter
} = require('../../globals/config');
const { BrowserWindow, dialog } = require('electron');
const { promisify } = require('util');

const DialogType = {
  Open: 'Open',
  Save: 'Save'
};

// https://electronjs.org/docs/api/dialog
// The browserWindow argument allows the dialog to attach itself to a parent window, making it modal.
function showDialogCommon(
  fileFilters,
  dialogMessage,
  callBack,
  defaultPath,
  dialogType = DialogType.Open
) {
  const browserWindow = BrowserWindow.getFocusedWindow();

  let dialogTitle = config.appName;
  let dialogFuncToCall = _ => {};
  switch (dialogType) {
    case DialogType.Save:
      dialogTitle += ' - Save';
      dialogFuncToCall = dialog.showSaveDialog;
      break;
    case DialogType.Open:
    default:
      dialogTitle = ' - Open';
      dialogFuncToCall = dialog.showOpenDialog;
      break;
  }

  const optionsObj = {
    title: dialogTitle,
    defaultPath: defaultPath,
    filters: fileFilters,
    properties: ['openFile'],
    message: dialogMessage
  };

  dialogFuncToCall(browserWindow, optionsObj, data => {
    const err = null;
    callBack(err, data);
  });
}

function openImageDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.image],
    'Please select an image file.',
    callBack,
    null,
    DialogType.Open
  );
}

const openImageDialogPromise = promisify(openImageDialog);

// probably not used in future as now openImageDialog() includes open gif files
function openGifDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.gif],
    'Please select a gif file.',
    callBack,
    null,
    DialogType.Open
  );
}

const openGifDialogPromise = promisify(openGifDialog);

function openVideoDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.video],
    'Please select a video file.',
    callBack,
    null,
    DialogType.Open
  );
}

const openVideoDialogPromise = promisify(openVideoDialog);

function openSchoolVrFileDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.schoolVrFile],
    'Please select a School VR file.',
    callBack,
    appDirectory.appProjectsDirectory,
    DialogType.Open
  );
}

const openSchoolVrFileDialogPromise = promisify(openSchoolVrFileDialog);

function saveSchoolVrFileDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.schoolVrFile],
    'Please select a School VR file.',
    callBack,
    appDirectory.appProjectsDirectory,
    DialogType.Save
  );
}

const saveSchoolVrFileDialogPromise = promisify(saveSchoolVrFileDialog);

function save360ImageDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.image],
    'Please select an image file.',
    callBack,
    `untitled${config.captured360ImageExtension}`,
    DialogType.Save
  );
}

const save360ImageDialogPromise = promisify(save360ImageDialog);

function save360VideoDialog(callBack) {
  showDialogCommon(
    [openFileDialogFilter.video],
    'Please select a video file.',
    callBack,
    `untitled${config.captured360VideoExtension}`,
    DialogType.Save
  );
}

const save360VideoDialogPromise = promisify(save360VideoDialog);

module.exports = {
  openImageDialog,
  openImageDialogPromise,
  openGifDialog,
  openGifDialogPromise,
  openVideoDialog,
  openVideoDialogPromise,
  openSchoolVrFileDialog,
  openSchoolVrFileDialogPromise,
  saveSchoolVrFileDialog,
  saveSchoolVrFileDialogPromise,
  save360ImageDialog,
  save360ImageDialogPromise,
  save360VideoDialogPromise
};
