const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;
const shell = electron.shell;

const {appDirectory} = require('./globals/config');

const myPath = require('./utils/fileSystem/myPath');
//const url = require('url');
const isDev = require('electron-is-dev');
const {fork} = require('child_process');
const {forEach} = require('p-iteration');

const jsoncParser = require('jsonc-parser');

const mime = require('./utils/fileSystem/mime');
const fileSystem = require('./utils/fileSystem/fileSystem');
const ProjectFile = require('./utils/saveLoadProject/ProjectFile');
const {saveProjectToLocalAsync} = require('./utils/saveLoadProject/saveProject');
const {loadProjectByProjectFilePathAsync} = require('./utils/saveLoadProject/loadProject');
const {openImageDialog, openGifDialog, openVideoDialog, openSchoolVrFileDialog} = 
  require('./utils/aframeEditor/openFileDialog');
const {parseDataToSaveFormat} = require('./utils/saveLoadProject/parseDataToSaveFormat');


/* constants */

const configFilePath = './config.jsonc';

// default values
let webServerPort = 1413;
//let webServerRootDirPath = __dirname;  // public folder

let splashScreenDurationInMillis = 2000;

let developmentServerPort = process.env.PORT || 1234;

//const appAsarInstallationPath = myPath.join(app.getAppPath(), 'resources', 'app.asar');
const appAsarInstallationPath = myPath.join(app.getPath('appData'), '..', 'Local', 'Programs', 'School VR', 'resources', 'app.asar');
console.log(appAsarInstallationPath);
const appAsarDestPathInWorkingDirectory = myPath.join(appDirectory.appTempAppWorkingDirectory, 'resources');
console.log(appAsarDestPathInWorkingDirectory);
const webServerRootDirectory = myPath.join(appAsarDestPathInWorkingDirectory, 'build');
console.log(webServerRootDirectory);

/* end of constants */


/* global variables */

let mainWindow;
// https://fabiofranchino.com/blog/use-electron-as-local-webserver/
let webServerProcess = fork(`${myPath.join(__dirname, 'server', 'easyrtc-server.js')}`);
let paramsFromExternalConfigForReact;

/* end of global variables */


async function readConfigFile(configFile) {
  const data = await fileSystem.readFilePromise(configFile);
  const configObj = jsoncParser.parse(data);
  const configObjForElectron = configObj.electron;
  paramsFromExternalConfigForReact = configObj.react;      

  // set some global variables
  developmentServerPort = configObjForElectron.developmentServerPort || developmentServerPort;

  webServerPort = configObjForElectron.webServerPort || webServerPort;
  //webServerRootDirPath = configObjForElectron.webServerRootDirPath || webServerRootDirPath;      

  splashScreenDurationInMillis = configObjForElectron.splashScreenDurationInMillis || splashScreenDurationInMillis;          
}

function createWindow() {
  const Menu = electron.Menu;
  const MenuItem = electron.MenuItem;
  let mainWindowReady = false;
  let splashScreenCountdowned = false;
  const splashScreen = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    movable: false,
    frame: false,
    skipTaskbar: true,
    show: false
  });
  
  
  /* setting up mainWindow */

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 810,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    show: false, 
    webPreferences: { webSecurity: false },  // for saving and loading assets via local path
  });

  splashScreen.loadURL(`file://${myPath.join(__dirname, 'splash.html')}`);
  //mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}/file-explorer` : `file://${myPath.join(__dirname, '../build/index.html')}`);
  //mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}` : `file://${myPath.join(__dirname, '../build/index.html')}`);
  mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}/projectlist` : `file://${myPath.join(__dirname, '../build/index.html')}`);
  
  function showMainWindow() {
    if (mainWindowReady && splashScreenCountdowned) {
      mainWindow.show();
      splashScreen.close();      
    }
  }

  splashScreen.on('ready-to-show', () => {    
    splashScreen.show();
    setTimeout(_ => {
      splashScreenCountdowned = true;
      showMainWindow();      
    }, splashScreenDurationInMillis);
  });

  /* main window lifecycles */

  mainWindow.on('ready-to-show', () => {    
    mainWindowReady = true;
    showMainWindow();
  });    

  mainWindow.on('closed', () => {
    mainWindow = null;    
  });    

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximize');
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('unmaximize');
  });

  /* end of main window lifecycles */

  /* end of setting up mainWindow */


  /* setting up menu for hot keys purpose only */

  const menu = new Menu();

  menu.append(new MenuItem({
    label: 'Toggle DevTools',
    accelerator: 'F12',
    click: () => { 
      mainWindow.webContents.toggleDevTools();
    }
  }));

  // https://electronjs.org/docs/tutorial/keyboard-shortcuts
  // const ret = globalShortcut.register('F5', () => {
  //   mainWindow.reload();
  // })

  menu.append(new MenuItem({
    label: 'Refresh',
    accelerator: 'F5',
    click: () => {              
      mainWindow.reload();            
    }
  }));

  // all windows of this application share same menu
  Menu.setApplicationMenu(menu);

  /* end of setting up menu for hot keys purpose only */
}

async function openWebServer() {
  
  
  await fileSystem.myDeletePromise(appAsarDestPathInWorkingDirectory);
  console.log("reach here 1");
  fileSystem.extractAll(appAsarInstallationPath, appAsarDestPathInWorkingDirectory);
  console.log("reach here 2");

  // https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
  webServerProcess.send({
    address: 'open-server',
    port: webServerPort,
    rootDirPath: webServerRootDirectory
  });      
}

function closeWebServer() {

}


/* app lifecycles */

app.on('ready', async _ => {
  try {
    await readConfigFile(configFilePath);
  } catch (err) {
    console.error(err);
  }

  //await openWebServer();
  createWindow(); 
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/* end of app lifecycles */


/* ipc main event listeners */
/**
 * !!! Important !!! 
 * Note Error object cannot be passed as argument.
 */

function getSenderWindowFromEvent(ipcEvent) {  
  return BrowserWindow.fromWebContents(ipcEvent.sender);
}

// ipcMain.on('invokeAction', (event, arg) => {
//   const result = processData(data);
//   event.sender.send('actionReply', result);
// });

ipcMain.on('getParamsFromExternalConfig', (event, arg) => { 
  event.sender.send('getParamsFromExternalConfigResponse', {
    err: null,
    data: paramsFromExternalConfigForReact
  });
});

// app

// // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
ipcMain.on('getAppData', (event, arg) => {
  const data = {
    appName: app.getName(),
    homePath: app.getPath('home'),
    appDataPath: app.getPath('appData'),
    documentsPath: app.getPath('documents')
  };
  event.sender.send('getAppDataResponse', {
    err: null,
    data: data
  });
});

// shell
ipcMain.on('shellOpenItem', (event, arg) => {
  const filePath = arg;
  shell.openItem(filePath);
});

// electron window api

ipcMain.on('newBrowserWindow', (event, arg) => {
  const windowOptions = arg.windowOptions;
  const url = arg.url;
  const newWindow = new BrowserWindow(windowOptions);
  newWindow.loadURL(url);
  event.sender.send('newBrowserWindowResponse', {
    err: null,
    data: {
      newWindow: newWindow
    }
  });
});

ipcMain.on('close', (event, arg) => {  
  const senderWindow = getSenderWindowFromEvent(event);
  senderWindow.close();  
});

ipcMain.on('minimize', (event, arg) => {  
  const senderWindow = getSenderWindowFromEvent(event);
  senderWindow.minimize();  
});

ipcMain.on('toggleMaximize', (event, arg) => {  
  const senderWindow = getSenderWindowFromEvent(event);
  if (senderWindow.isMaximized()) {
    senderWindow.unmaximize();
  } else {
    senderWindow.maximize();
  }
});

ipcMain.on('toggleDevTools', (event, arg) => {
  event.sender.toggleDevTools();
});

// fileSystem

ipcMain.on('mimeStat', (event, arg) => {
  const filePath = arg;
  try {
    const mimeStat = mime.statSync(filePath);
    event.sender.send('mimeStatResponse', {
      err: null,
      data: {
        mimeStat: mimeStat
      }
    });
  } catch (err) {
    console.error(err);
    event.sender.send('mimeStatResponse', {
      err: err.toString(),
      data: null
    });
  }  
});

ipcMain.on('mimeStats', (event, arg) => {
  const filePaths = arg;
  try {
    const mimeStats = filePaths.map(filePath => mime.statSync(filePath));
    event.sender.send('mimeStatsResponse', {
      err: null,
      data: {
        mimeStats: mimeStats
      }
    });
  } catch (err) {
    console.error(err);
    event.sender.send('mimeStatsResponse', {
      err: err.toString(),
      data: null
    });
  }  
});

ipcMain.on('base64Encode', async (event, arg) => {
  const filePath = arg;
  try {
    const encodedStr = await fileSystem.base64EncodePromise(filePath);
    event.sender.send('base64EncodeResponse', {
      err: null,
      data: {
        encodedStr: encodedStr
      }
    });
  } catch (err) {
    console.error(err);
    event.sender.send('base64EncodeResponse', {
      err: err.toString(),
      data: null
    });
  }  
});

ipcMain.on('base64Decode', async (event, arg) => {  
  try {
    await fileSystem.base64DecodePromise(arg.locationToSaveFile, arg.encodedStr);
    event.sender.send('base64DecodeResponse', {
      err: null,      
    });
  } catch (err) {
    console.error(err);
    event.sender.send('base64DecodeResponse', {
      err: err.toString(),      
    });
  }  
});

ipcMain.on('createPackage', async (event, arg) => {  
  try {
    await fileSystem.createPackagePromise(arg.src, arg.dest);
    event.sender.send('createPackageResponse', {
      err: null,      
    });
  } catch (err) {
    console.error(err);
    event.sender.send('createPackageResponse', {
      err: err.toString(),      
    });
  }
});

ipcMain.on('extractAll', (event, arg) => {  
  try {
    fileSystem.extractAll(arg.archive, arg.dest);
    event.sender.send('extractAllResponse', {
      err: null,      
    });
  } catch (err) {
    console.error(err);
    event.sender.send('extractAllResponse', {
      err: err.toString(),      
    });
  }
});

ipcMain.on('readdir', async (event, arg) => {  
  try {
    const dirPath = arg;
    const fileNames = await fileSystem.readdirPromise(dirPath);
    event.sender.send('readdirResponse', {
      err: null,
      data: {
        fileNames: fileNames
      }   
    });
  } catch (err) {
    console.error(err);
    event.sender.send('readdirResponse', {
      err: err.toString(),
      data: null
    });
  }
});

ipcMain.on('createDirectoriesIfNotExists', async (event, arg) => {
  const directoryPaths = arg;
  try {
    await forEach(directoryPaths, async (directoryPath) => {
      await fileSystem.createDirectoryIfNotExistsPromise(directoryPath);
    });
    event.sender.send('createDirectoriesIfNotExistsResponse', {
      err: null,
      data: null
    });
  } catch (err) {
    console.error(err);
    event.sender.send('createDirectoriesIfNotExistsResponse', {
      err: err.toString(),
      data: null
    });
  }  
});

ipcMain.on('readFile', async (event, arg) => {
  try {
    const filePath = arg;
    const content = await fileSystem.readFilePromise(filePath);
    event.sender.send('readFileResponse', {
      err: null,
      data: {
        content: content
      }
    });
  } catch (err) {
    console.error(err);
    event.sender.send('readFileResponse', {
      err: err.toString(),
      data: null
    });
  } 
});

ipcMain.on('writeFile', async (event, arg) => {
  try {
    await fileSystem.writeFilePromise(arg.filePath, arg.content);    
    event.sender.send('writeFileResponse', {
      err: null      
    });
  } catch (err) {
    console.error(err);
    event.sender.send('writeFileResponse', {
      err: err.toString()      
    });
  } 
});

ipcMain.on('deleteFile', async (event, arg) => {
  try {
    const filePath = arg;
    await fileSystem.myDeletePromise(filePath);    
    event.sender.send('deleteFileResponse', {
      err: null
    });
  } catch (err) {
    console.error(err);
    event.sender.send('deleteFileResponse', {
      err: err.toString()      
    });
  } 
});

// saveLoadProject

ipcMain.on('listProjects', async (event, arg) => {  
  ProjectFile.listProjectsAsync()
    .then((projectFileObjs) => {      
      event.sender.send('listProjectsResponse', {
        err: null,
        data: {
          projectFileObjs: projectFileObjs
        }
      });
    })
    .catch(err => {
      console.error(err);
      event.sender.send('listProjectsResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('getExistingProjectNames', async (event, arg) => {  
  ProjectFile.getExistingProjectNamesAsync()
    .then((existingProjectNames) => {      
      event.sender.send('getExistingProjectNamesResponse', {
        err: null,
        data: {
          existingProjectNames: existingProjectNames
        }
      });
    })
    .catch(err => {
      console.error(err);
      event.sender.send('getExistingProjectNamesResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('saveProject', (event, arg) => {
  saveProjectToLocalAsync(arg.projectName, arg.entitiesList, arg.assetsList)
    .then((data) => {      
      event.sender.send('saveProjectResponse', {
        err: null,
        data: {
          projectJson: data
        }
      });
    })
    .catch(err => {
      console.error(err);
      event.sender.send('saveProjectResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('parseDataToSaveFormat', (event, arg) => {
  parseDataToSaveFormat(arg.projectName, arg.entitiesList, arg.assetsList)
    .then((data) => {           
      event.sender.send('parseDataToSaveFormatResponse', {
        err: null,
        data: {
          projectJson: data
        }
      });
    })
    .catch(err => {
      console.error(err);
      event.sender.send('parseDataToSaveFormatResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('loadProjectByProjectFilePath', (event, arg) => {
  const filePath = arg;
  loadProjectByProjectFilePathAsync(filePath)
    .then((data) =>{
      event.sender.send('loadProjectByProjectFilePathResponse', {
        err: null,
        data: {
          projectJson: data
        }
      });
    })
    .catch(err => {
      console.error(err);
      event.sender.send('loadProjectByProjectFilePathResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('deleteAllTempProjectDirectories', (event, arg) => {
  ProjectFile.deleteAllTempProjectDirectoriesAsync()
    .then(() => {
      event.sender.send('deleteAllTempProjectDirectoriesResponse', {
        err: null,        
      });
    })
    .catch(err => {
      console.error(err);
      event.sender.send('deleteAllTempProjectDirectoriesResponse', {
        err: err.toString(),
      });
    });
});

// window dialog

ipcMain.on('openImageDialog', (event, args) => {
  console.log('openImageDialog');
  openImageDialog((filePaths) => {
    event.sender.send('openImageDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openGifDialog', (event, args) => {
  openGifDialog((filePaths) => {
    event.sender.send('openGifDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openVideoDialog', (event, args) => {
  console.log('openVideoDialog');
  openVideoDialog((filePaths) => {
    event.sender.send('openVideoDialogResponse', {
      data: {
        filePaths: filePaths,
        type: myPath.getMimeType(filePaths[0])
      }
    });
  });
});

ipcMain.on('openSchoolVrFileDialog', (event, args) => {
  openSchoolVrFileDialog((filePaths) => {
    event.sender.send('openSchoolVrFileDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

// vanilla electron dialog

ipcMain.on('showOpenDialog', (event, args) => {
  const options = args;
  dialog.showOpenDialog(options, (filePaths) => {
    event.sender.send('showOpenDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('showSaveDialog', (event, args) => {
  const options = args;
  dialog.showOpenDialog(options, (filePath) => {
    event.sender.send('showSaveDialogResponse', {
      data: {
        filePath: filePath
      }
    });
  });
});

/* end of ipc main event listeners */