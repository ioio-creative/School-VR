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

openFileDialogFilter.allFiles = { name: 'All Files', extensions: ['*'] };

/* end of derivatives from Media */


const config = {
  appName: appName,
  appDirectory: appDirectory,
  schoolVrProjectArchiveExtensionWithLeadingDot: '.ivr',
  jsonFileExtensionWithLeadingDot: '.json'
};

export default config;

export {
  mediaType,
  appDirectory,
  projectDirectoryStructure,
  openFileDialogFilter
};
