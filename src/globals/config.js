import fileHelper from 'utils/fileHelper/fileHelper';
import {invokeIfIsFunction} from 'utils/variableType/isFunction';


const schoolVrProjectArchiveExtensionWithLeadingDot = '.ivr';


let config = {
  webServerStaticFilesPathPrefix: 'files',
  schoolVrProjectArchiveExtensionWithLeadingDot: schoolVrProjectArchiveExtensionWithLeadingDot,
  jsonFileExtensionWithLeadingDot: '.json'
};
let appDirectory = {};
const setAppData = (appName, homePath, appDataPath, documentsPath, callBack = null) => {
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
  appDirectory.homeDirectory = homePath;

  appDirectory.appProjectsDirectory = fileHelper.join(documentsPath, `${appName}-Projects`);

  appDirectory.appDataDirectory = fileHelper.join(appDataPath, `${appName}-Data`);

  appDirectory.appTempDirectory = fileHelper.join(appDataPath, `${appName}-Temp`);
  appDirectory.appTempProjectsDirectory = fileHelper.join(appDirectory.appTempDirectory, `${appName}-Projects`);
  appDirectory.appTempAppWorkingDirectory = fileHelper.join(appDirectory.appTempDirectory, `${appName}-App-Working`);
  appDirectory.appTempWebContainerDirectory = fileHelper.join(appDirectory.appTempAppWorkingDirectory, 'web');

  appDirectory.webServerFilesDirectory = fileHelper.join(appDirectory.appTempWebContainerDirectory, 'files');

  // make first letter of each word upper-case
  config.appName = appName.split('-').map(str => {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }).join(' ');
  config.appDirectory = appDirectory;

  invokeIfIsFunction(callBack);
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

openFileDialogFilter.schoolVrFile = { name: 'School VR Files', extensions: [schoolVrProjectArchiveExtensionWithLeadingDot.substr(1)] };
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

export default config;

export {
  setAppData,

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