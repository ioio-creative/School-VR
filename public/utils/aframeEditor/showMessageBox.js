// https://electronjs.org/docs/api/dialog
// https://www.christianengvall.se/electron-show-messagebox/
const { BrowserWindow, dialog } = require('electron');
const { config } = require('../../globals/config');


function showMessageBoxCommon(options, callBack) {
  const browserWindow = BrowserWindow.getFocusedWindow();
  options.title = config.appName;
  dialog.showMessageBox(browserWindow, options, (response, checkboxChecked) => {
    callBack(response);
  });
}

function showYesNoQuestionMessageBox(message, detail, callBack) {
  const options = {
    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    cancelId: 1, 
    message: message,
    detail: detail,
    // checkboxLabel: 'Remember my answer',
    // checkboxChecked: true
  };
  
  showMessageBoxCommon(options, callBack);
}

function showYesNoWarningMessageBox(message, detail, callBack) {
  const options = {
    type: 'warning',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    cancelId: 1,    
    message: message,
    detail: detail,
    // checkboxLabel: 'Remember my answer',
    // checkboxChecked: true
  };
  
  showMessageBoxCommon(options, callBack);
}


module.exports = {
  showYesNoQuestionMessageBox,
  showYesNoWarningMessageBox
};