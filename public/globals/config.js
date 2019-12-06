const electron = require('electron');
const {app} = electron;
const myPath = require('../utils/fileSystem/myPath');


const appName = app.getName();

// https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
const appDirectory = {};

appDirectory.appProjectsDirectory = myPath.join(app.getPath('documents'), `${appName}-Projects`);

appDirectory.appDataDirectory = myPath.join(app.getPath('appData'), `${appName}-Data`);

/* customized app data */
appDirectory.customizedAppDataFile = myPath.join(appDirectory.appDataDirectory, 'customizedAppData.json');

appDirectory.appTempDirectory = myPath.join(app.getPath('appData'), `${appName}-Temp`);
appDirectory.appTempProjectsDirectory = myPath.join(appDirectory.appTempDirectory, `${appName}-Projects`);
appDirectory.appTempAppWorkingDirectory = myPath.join(appDirectory.appTempDirectory, `${appName}-App-Working`);
appDirectory.appTempWebContainerDirectory = myPath.join(appDirectory.appTempAppWorkingDirectory, 'web');
appDirectory.appTempCapturesContainerDirectory = myPath.join(appDirectory.appTempAppWorkingDirectory, 'captures');

//appDirectory.appAsarInstallationPath = myPath.join(app.getAppPath(), 'resources', 'app.asar');
appDirectory.appAsarInstallationPath = myPath.join(app.getPath('appData'), '..', 'Local', 'Programs', app.getName(), 'resources', 'app.asar');
appDirectory.webServerRootDirectory = myPath.join(appDirectory.appAsarInstallationPath, 'build');  // directly serves within app.asar (which acts as a directory)
appDirectory.webServerFilesDirectory = myPath.join(appDirectory.appTempWebContainerDirectory, 'files');


/* !!! Important !!! Directories to be created on app start-up */
appDirectory.createOnStartUpDirectories = [
  appDirectory.appProjectsDirectory,
  appDirectory.appDataDirectory,
  
  appDirectory.appTempDirectory,
  appDirectory.appTempProjectsDirectory,
  appDirectory.appTempAppWorkingDirectory,
  appDirectory.appTempWebContainerDirectory,
  appDirectory.appTempCapturesContainerDirectory
];

/* !!! Important !!! Directories to be deleted on app close-down */
appDirectory.deleteOnCloseDownDirectories = [
  appDirectory.webServerFilesDirectory,
  appDirectory.appTempCapturesContainerDirectory
];


const config = {
  appName: appName,
  appDirectory: appDirectory,
  webServerStaticFilesPathPrefix: 'files',
  schoolVrProjectArchiveExtensionWithLeadingDot: '.ivr',
  jsonFileExtensionWithLeadingDot: '.json',
  captured360ImageExtendsion: '.png',
  captured360VideoExtendsion: '.mp4',
};

// https://electronjs.org/docs/api/dialog
const Media = {
  image: {
    typeName: 'image',
    directoryUnderProjectDirectory: 'Images',
    openFileDialogFilter: { name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg'] }
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