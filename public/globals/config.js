const electron = require('electron');
const { app } = electron;
const myPath = require('../utils/fileSystem/myPath');


const appName = app.getName();

const appDirectory = {
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
  appProjectsDirectory: myPath.join(app.getPath('documents'), `${appName}-Projects`), 
  
  appDataDirectory: myPath.join(app.getPath('appData'), `${appName}-Data`),      
  
  appTempDirectory: myPath.join(app.getPath('appData'), `${appName}-Temp`),
  appTempProjectsDirectory: myPath.join(appDirectory.appTempDirectory, `${appName}-Projects`),
  appTempAppWorkingDirectory: myPath.join(appDirectory.appTempDirectory, `${appName}-App-Working`),
  appTempWebContainerDirectory: myPath.join(appDirectory.appTempAppWorkingDirectory, 'web'),  

  //appAsarInstallationPath: myPath.join(app.getAppPath(), 'resources', 'app.asar'),
  appAsarInstallationPath: myPath.join(app.getPath('appData'), '..', 'Local', 'Programs', app.getName(), 'resources', 'app.asar'),
  appAsarDestPathInWebContainerDirectory: myPath.join(appDirectory.appTempWebContainerDirectory, 'resources'),
  webServerRootDirectory: myPath.join(appDirectory.appAsarDestPathInWebContainerDirectory, 'build'),
  webServerFilesDirectory: myPath.join(appDirectory.appTempWebContainerDirectory, 'files'),
};

const config = {
  appName: appName,
  appDirectory: appDirectory,
  schoolVrProjectArchiveExtensionWithLeadingDot: '.ivr',
  jsonFileExtensionWithLeadingDot: '.json'
};

// https://electronjs.org/docs/api/dialog
const Media = {
  image: {
    typeName: 'image',
    directoryUnderProjectDirectory: 'Images',
    openFileDialogFilter: { name: 'Images', extensions: ['jpg', 'png'] }
  },
  gif: {
    typeName: 'gif',
    directoryUnderProjectDirectory: 'Gifs',
    openFileDialogFilter: { name: 'Gifs', extensions: ['gif'] }
  },
  video: {
    typeName: 'video',
    directoryUnderProjectDirectory: 'Videos',
    openFileDialogFilter: { name: 'Videos', extensions: ['mp4'] }
  }
};


/* derivatives from Media */

let mediaType = {},
  projectDirectoryStructure = {},
  openFileDialogFilter = {};

for (let key of Object.keys(Media)) {
  const MediumTypeObj = Media[key];
  
  mediaType[key] = MediumTypeObj.typeName;
  projectDirectoryStructure[key] = MediumTypeObj.directoryUnderProjectDirectory;
  
  // https://electronjs.org/docs/api/dialog
  openFileDialogFilter[key] = MediumTypeObj.openFileDialogFilter;
}

openFileDialogFilter.schoolVrFile = { name: 'School VR Files', extensions: [config.schoolVrProjectArchiveExtensionWithLeadingDot.substr(1)] };
openFileDialogFilter.allFiles = { name: 'All Files', extensions: ['*'] };

/* end of derivatives from Media */


let paramsReadFromExternalConfig = {
  something: 1,
};
let setParamsReadFromExternalConfig = (configObj) => {
  paramsReadFromExternalConfig = {...paramsReadFromExternalConfig, ...configObj};  
};


/* to prove that export is "pass-by-reference"*/
// let something = 1;
// let changeSomething = (val) => {
//   something = val;
// };

module.exports = {
  config,
  mediaType,
  appDirectory,
  projectDirectoryStructure,
  openFileDialogFilter,
  // something,
  // changeSomething,

  paramsReadFromExternalConfig,
  setParamsReadFromExternalConfig
};

// something = 2;