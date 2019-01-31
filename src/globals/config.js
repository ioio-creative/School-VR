const electron = window.require('electron');
const remote = electron.remote;
const { app } = remote;

const path = window.require('path');

const appName = app.getName();

const appDirectory = {
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname  
  appDataDirectory: path.join(app.getPath('appData'), `${appName}-Data`),  
  appProjectsDirectory: path.join(app.getPath('documents'), `${appName}-Projects`),  
  appTempDirectory: path.join(app.getPath('appData'), `${appName}-Temp`),
  appTempProjectsDirectory: path.join(app.getPath('appData'), `${appName}-Temp`, `${appName}-Projects`)
};

const config = {
  appName: appName,
  appDirectory: appDirectory,
  schoolVrProjectArchiveExtensionWithLeadingDot: '.ivr',
  jsonFileExtensionWithLeadingDot: '.json'
};

export default config;

export { appDirectory };
