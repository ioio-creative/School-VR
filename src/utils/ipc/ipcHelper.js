import isFunction from 'utils/variableType/isFunction';


const electron = window.require ? window.require('electron') : null;
const dummyFunc = (param1, param2, param3) => { 
  // console.log(param1, param2, param3);
  // console.log('not in electron app, no ipc')
  if (param1 === "saveProject") {
    localStorage.setItem('schoolVRSave', JSON.stringify(param2));
  }
  else if (param1 === "openSchoolVrFileDialogResponse") {
    // const loadFile = JSON.parse(localStorage.getItem('schoolVRSave'));
    param2(null, {
      data: {
        filePaths: ['hello']
      }
    });
  } else if (param1 === "saveSchoolVrFileDialogResponse") {
    param2(null, {
      data: {
        filePath: 'schoolVRWebSave.test'
      }
    });
  }
  else if (param1 === "isCurrentLoadedProjectResponse") {
    // const loadFile = JSON.parse(localStorage.getItem('schoolVRSave'));
    param2(null, {
      data: {
        isCurrentLoadedProject: false
      }
    });
  }
  else if (param1 === "loadProjectByProjectFilePathResponse") {
    const loadFile = JSON.parse(localStorage.getItem('schoolVRSave'));
    param2(null, {
      data: {
        projectJson: loadFile
      }
    });
  }
  // debugger;
};
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

function shellOpenExternal(url) {
  generalIpcCall('shellOpenExternal', null, url);
}

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

function isCurrentLoadedProject(projectFilePath, callBack) {
  generalIpcCall('isCurrentLoadedProject', callBack, projectFilePath);
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
  generalIpcCall('showOpenDialog', callBack, options);
}

function showSaveDialog(options, callBack) {  
  generalIpcCall('showSaveDialog', callBack, options);
}

/* end of vanilla electron dialog */


/* show message box */

function showYesNoQuestionMessageBox(message, detail, callBack) {
  generalIpcCall('showYesNoQuestionMessageBox', callBack, {    
    message: message,
    detail: detail
  });
}

function showYesNoWarningMessageBox(message, detail, callBack) {
  generalIpcCall('showYesNoWarningMessageBox', callBack, {    
    message: message,
    detail: detail
  });
}

/* end of show message box */


/* for presentation */

function getPresentationServerInfo(callBack) {
  generalIpcCall('getPresentationServerInfo', callBack);
}

function openWebServerAndLoadProject(filePath, callBack) {
  generalIpcCall('openWebServerAndLoadProject', callBack, filePath);
}

function closeWebServer(callBack) {
  generalIpcCall('closeWebServer', callBack);
}

/* end of for presentation */


export default {
  // listeners
  addListener,
  removeListener,

  getParamsFromExternalConfig,

  // app
  getAppData,

  // shell
  shellOpenItem,
  shellOpenExternal,

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
  readFile,
  writeFile,
  deleteFile,

  // saveLoadProject
  listProjects,
  getExistingProjectNames,
  saveProject,
  parseDataToSaveFormat,
  loadProjectByProjectFilePath,  
  isCurrentLoadedProject,

  // window dialog
  openImageDialog,
  openGifDialog,
  openVideoDialog,
  openSchoolVrFileDialog,
  saveSchoolVrFileDialog,

  // vanilla electron dialog
  showOpenDialog,
  showSaveDialog,

  // show message box
  showYesNoQuestionMessageBox,
  showYesNoWarningMessageBox,

  // for presentation
  getPresentationServerInfo,
  openWebServerAndLoadProject,
  closeWebServer,
};