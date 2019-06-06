import isFunction from 'utils/variableType/isFunction';


const electron = window.require ? window.require('electron') : null;
const dummyFunc = _=>{ console.log('not in electron app, no ipc') };
const ipc = electron ? electron.ipcRenderer : {
  on: dummyFunc,
  removeListener: dummyFunc,
  once: dummyFunc,
  send: dummyFunc
};


/* listeners */

function addListener(channel, listener) {
  ipc.on(channel, listener);
}

function removeListener(channel, listener) {
  ipc.removeListener(channel, listener);
}

/* end of listeners */


function generalIpcCall(channelName, callBack = null, objToSend = null) {
  if (isFunction(callBack)) {
    ipc.once(`${channelName}Response`, (event, arg) => {
      if (arg.err) {
        callBack(`${channelName}: ${arg.err}`, arg.data);
      } else {
        callBack(null, arg.data);
      }
    });
  }

  if (objToSend) {
    ipc.send(channelName, objToSend);
  } else {
    ipc.send(channelName);
  }
}


function getParamsFromExternalConfig(callBack) {  
  generalIpcCall('getParamsFromExternalConfig', callBack);
};


/* app */

function getAppData(callBack) {
  generalIpcCall('getAppData', callBack);  
};

/* end of app */


/* shell */

function shellOpenItem(filePath) {
  generalIpcCall('shellOpenItem', null, filePath);
};

/* end of shell */


/* electron window api */

function newBrowserWindow(windowOptions, url, callBack) {
  generalIpcCall('newBrowserWindow', callBack, {
    windowOptions: windowOptions,
    url: url
  });
}

function closeWindow() {
  generalIpcCall('close');
};

function minimizeWindow() {
  generalIpcCall('minimize');
};

function toggleMaximizeWindow() {
  generalIpcCall('toggleMaximize');
};

function toggleDevTools() {
  generalIpcCall('toggleDevTools', true);
};

/* end of electron window api */


/* fileSystem */

function mimeStat(filePath, callBack) {  
  generalIpcCall('mimeStat', callBack, filePath);
}

function mimeStats(filePaths, callBack) {  
  generalIpcCall('mimeStats', callBack, filePaths);
}

function base64Encode(filePath, callBack) {  
  generalIpcCall('base64Encode', callBack, filePath);
};

function base64Decode(locationToSaveFile, encodedStr, callBack) {  
  generalIpcCall('base64Decode', callBack, {
    locationToSaveFile: locationToSaveFile,
    encodedStr: encodedStr
  });
};

function createPackage(src, dest, callBack) {  
  generalIpcCall('createPackage', callBack, {
    src: src,
    dest: dest
  });
};

function extractAll(archive, dest, callBack) {  
  generalIpcCall('extractAll', callBack, {
    archive: archive,
    dest: dest
  });
};

function readdir(dirPath, callBack) {  
  generalIpcCall('readdir', callBack, {
    dirPath: dirPath,    
  });
}

function createDirectoriesIfNotExists(directoryPaths, callBack) {  
  generalIpcCall('createDirectoriesIfNotExists', callBack, directoryPaths);
};

function readFile(filePath, callBack) {  
  generalIpcCall('readFile', callBack, filePath);
};

function writeFile(filePath, content, callBack) {  
  generalIpcCall('writeFile', callBack, {
    filePath: filePath,
    content: content
  });
};

function deleteFile(filePath, callBack) {
  generalIpcCall('deleteFile', callBack, filePath);
};

/* end of fileSystem */


/* saveLoadProject */

function listProjects(callBack) {  
  generalIpcCall('listProjects', callBack);
};

function getExistingProjectNames(callBack) {  
  generalIpcCall('getExistingProjectNames', callBack);
};

function saveProject(projectFilePath, entitiesList, assetsList, callBack) {  
  generalIpcCall('saveProject', callBack, {
    projectFilePath: projectFilePath,    
    entitiesList: entitiesList,
    assetsList: assetsList
  });
};

function parseDataToSaveFormat(projectName, entitiesList, assetsList, callBack) {  
  generalIpcCall('parseDataToSaveFormat', callBack, {
    projectName: projectName,
    entitiesList: entitiesList,
    assetsList: assetsList
  });
}

function loadProjectByProjectFilePath(filePath, callBack) {  
  generalIpcCall('loadProjectByProjectFilePath', callBack, filePath);
};

// delete any cached temp project files
function deleteAllTempProjectDirectories(callBack) {
  generalIpcCall('deleteAllTempProjectDirectories', callBack);
}

/* end of saveLoadProject */


/* window diaglog */

function openImageDialog(callBack) {  
  generalIpcCall('openImageDialog', callBack);
}

function openGifDialog(callBack) {  
  generalIpcCall('openGifDialog', callBack);
}

function openVideoDialog(callBack) {  
  generalIpcCall('openVideoDialog', callBack);
}

function openSchoolVrFileDialog(callBack) {  
  generalIpcCall('openSchoolVrFileDialog', callBack);
}

function saveSchoolVrFileDialog(callBack) {
  generalIpcCall('saveSchoolVrFileDialog', callBack);
}

/* end of window dialog */


/* vanilla electron dialog */

function showOpenDialog(options, callBack) {  
  generalIpcCall('showOpenDialog', options, callBack);
}

function showSaveDialog(options, callBack) {  
  generalIpcCall('showSaveDialog', options, callBack);
}

/* end of vanilla electron dialog */


export default {
  // listeners
  addListener,
  removeListener,

  getParamsFromExternalConfig,

  // app
  getAppData,

  // shell
  shellOpenItem,

  // electron window api
  newBrowserWindow,
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
  toggleDevTools,  

  // fileSystem
  mimeStat,
  mimeStats,
  base64Encode,
  base64Decode,
  createPackage,
  extractAll,
  readdir,
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
  saveSchoolVrFileDialog,

  // vanilla electron dialog
  showOpenDialog,
  showSaveDialog
};