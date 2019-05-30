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


/* fileSystem */

const mimeStat = (filePath, callBack) => {
  ipc.once('mimeStatResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('mimeStat', filePath);
}

const mimeStats = (filePaths, callBack) => {
  ipc.once('mimeStatsResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('mimeStats', filePaths);
}

const base64Encode = (filePath, callBack) => {
  ipc.once('base64EncodeResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('base64Encode', filePath);
};

const base64Decode = (locationToSaveFile, encodedStr, callBack) => {
  ipc.once('base64DecodeResponse', (event, arg) => {
    callBack(arg.err);
  });
  ipc.send('base64Decode', {
    locationToSaveFile: locationToSaveFile,
    encodedStr: encodedStr
  });
};

const createPackage = (src, dest, callBack) => {
  ipc.once('createPackageResponse', (event, arg) => {
    callBack(arg.err);
  });
  ipc.send('createPackage', {
    src: src,
    dest: dest
  });
};

const extractAll = (archive, dest, callBack) => {
  ipc.once('extractAllResponse', (event, arg) => {
    callBack(arg.err);
  });
  ipc.send('extractAll', {
    archive: archive,
    dest: dest
  });
};

const readdir = (dirPath, callBack) => {
  ipc.once('readdirResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('readdir', {
    dirPath: dirPath,    
  });
}

const createDirectoriesIfNotExists = (directoryPaths, callBack) => {
  ipc.once('createDirectoriesIfNotExistsResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('createDirectoriesIfNotExists', directoryPaths);
};

const readFile = (filePath, callBack) => {
  ipc.once('readFileResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('readFile', filePath);
};

const writeFile = (filePath, content, callBack) => {
  ipc.once('writeFileResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('writeFile', {
    filePath: filePath,
    content: content
  });
};

const deleteFile = (filePath, callBack) => {
  ipc.once('deleteFileResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('deleteFile', filePath);
};

/* end of fileSystem */


/* saveLoadProject */

const listProjects = (callBack) => {
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


/* vanilla electron dialog */

const showOpenDialog = (callBack) => {
  ipc.once('showOpenDialogResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('showOpenDialog');
};

const showSaveDialog = (callBack) => {
  ipc.once('showSaveDialogResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('showSaveDialog');
}

/* end of vanilla electron dialog */


export default {
  // electron window api
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
  toggleDevTools,

  getParamsFromExternalConfig,

  // fileSystem
  mimeStat,
  mimeStats,
  base64Encode,
  base64Decode,
  createPackage,
  extractAll,
  createDirectoriesIfNotExists,
  readFile,
  writeFile,
  deleteFile,

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

  // vanilla electron dialog
  showOpenDialog,
  showSaveDialog
};