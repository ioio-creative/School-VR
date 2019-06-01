import fileHelper from 'utils/fileHelper/fileHelper';


const schoolVrProjectArchiveExtensionWithLeadingDot = '.ivr';


let config = {};
let appDirectory = {};
const setAppData = (appName, homePath, appDataPath, documentsPath, callBack) => {
  appDirectory = {
    // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname  
    homeDirectory: homePath,
    
    appDataDirectory: fileHelper.join(appDataPath, `${appName}-Data`),  
    appProjectsDirectory: fileHelper.join(documentsPath, `${appName}-Projects`),  
    appTempDirectory: fileHelper.join(appDataPath, `${appName}-Temp`),
    appTempProjectsDirectory: fileHelper.join(appDataPath, `${appName}-Temp`, `${appName}-Projects`)
  };

  config = {
    appName: appName,
    appDirectory: appDirectory,
    schoolVrProjectArchiveExtensionWithLeadingDot: schoolVrProjectArchiveExtensionWithLeadingDot,
    jsonFileExtensionWithLeadingDot: '.json'
  };

  callBack();
}

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