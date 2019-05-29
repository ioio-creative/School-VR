const electron = window.require ? window.require('electron') : null;
const ipc = electron ? electron.ipcRenderer : null;


/* electron window api */

const closeWindow = () => {
  ipc.send('close');
};

const minimizeWindow = () => {
  ipc.send('minimize');
};

const toggleMaximizeWindow = () => {
  ipc.send('toggleMaximize');
};

const toggleDevTools = () => {
  ipc.send('toggleDevTools', true);
};

/* end of electron window api */


const getParamsFromExternalConfig = (callBack) => {
  ipc.once('getParamsFromExternalConfigResponse', (event, arg) => {    
    callBack(arg.err, arg.data);    
  });
  ipc.send('getParamsFromExternalConfig');
};


/* saveLoadProject */

const listProjects = () => {
  ipc.once('listProjectsResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('listProjects');
};

const getExistingProjectNames = (callBack) => {
  ipc.once('getExistingProjectNamesResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('getExistingProjectNames');
};

const saveProject = (projectName, entitiesList, assetsList, callBack) => {
  ipc.once('saveProjectResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('saveProject', {
    projectName: projectName,
    entitiesList: entitiesList,
    assetsList: assetsList
  });
};

const parseDataToSaveFormat = (projectName, entitiesList, assetsList, callBack) => {
  ipc.once('parseDataToSaveFormatResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('parseDataToSaveFormat', {
    projectName: projectName,
    entitiesList: entitiesList,
    assetsList: assetsList
  });
}

const loadProjectByProjectFilePath = (filePath, callBack) => {
  ipc.once('loadProjectByProjectFilePathResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('loadProjectByProjectFilePath', filePath);
};

// delete any cached temp project files
const deleteAllTempProjectDirectories = (callBack) => {
  ipc.once('deleteAllTempProjectDirectoriesResponse', (event, arg) => {
    callBack(arg.err);
  });
  ipc.send('deleteAllTempProjectDirectories');
};

/* end of saveLoadProject */


/* window diaglog */

const openImageDialog = (callBack) => {
  ipc.once('openImageDialogResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('openImageDialog');
};

const openGifDialog = (callBack) => {
  ipc.once('openGifDialogResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('openGifDialog');
};

const openVideoDialog = (callBack) => {
  ipc.once('openVideoDialogResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('openVideoDialog');
};

const openSchoolVrFileDialog = (callBack) => {
  ipc.once('openSchoolVrFileDialogResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('openSchoolVrFileDialog');
};

/* end of window dialog */


export default {
  // electron window api
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
  toggleDevTools,

  getParamsFromExternalConfig,

  // saveLoadProject
  listProjects,
  getExistingProjectNames,
  saveProject,
  parseDataToSaveFormat,
  loadProjectByProjectFilePath,
  deleteAllTempProjectDirectories,

  // window dialog
  openImageDialog,
  openGifDialog,
  openVideoDialog,
  openSchoolVrFileDialog,
};