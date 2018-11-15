const electron = window.require('electron');
const remote = electron.remote;
const { app } = remote;

const path = window.require('path');

const config = {
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname  
  appDataDirectory: path.join(app.getPath('documents'), `${app.getName()}-Data`),
  appTempWorkingDirectory: path.join(app.getPath('appData'), `${app.getName()}-Temp`),
  schoolVrProjectArchiveExtensionWithLeadingDot: '.iar'
};

export default config;