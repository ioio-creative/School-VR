const electron = window.require('electron');
const remote = electron.remote;
const { app } = remote;

const path = window.require('path');

const appName = app.getName();

const config = {
  appName: appName,
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname  
  appDataDirectory: path.join(app.getPath('documents'), `${appName}-Data`),
  appTempWorkingDirectory: path.join(app.getPath('appData'), `${appName}-Temp`),
  schoolVrProjectArchiveExtensionWithLeadingDot: '.iar'
};

export default config;