const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;
const shell = electron.shell;

const { appDirectory, config } = require('./globals/config');

const myPath = require('./utils/fileSystem/myPath');
const isDev = require('electron-is-dev');
const { fork } = require('child_process');
const { forEach } = require('p-iteration');

const jsoncParser = require('jsonc-parser');

const mime = require('./utils/fileSystem/mime');
const fileSystem = require('./utils/fileSystem/fileSystem');
const { write360ImageToTempPromise, write360ImageAsPartOfVideoToTempPromise, convertTempImageSequenceToVideoPromise } = require('./utils/captures/captures');
const ProjectFile = require('./utils/saveLoadProject/ProjectFile');
const { saveProjectToLocalAsync } = require('./utils/saveLoadProject/saveProject');
const { loadProjectByProjectFilePathAsync, copyTempProjectDirectoryToExternalDirectoryAsync } = require('./utils/saveLoadProject/loadProject');
const { openImageDialog, openGifDialog, openVideoDialog, openSchoolVrFileDialog, saveSchoolVrFileDialog, save360ImageDialogPromise } =
  require('./utils/aframeEditor/openFileDialog');
const { showYesNoQuestionMessageBox, showYesNoWarningMessageBox } = require('./utils/aframeEditor/showMessageBox');
const { parseDataToSaveFormat } = require('./utils/saveLoadProject/parseDataToSaveFormat');
const getIpAddress = require('./utils/network/getIpAddress');
const { getMacAddressHelper, getMacAddressPromiseHelper } = require('./utils/network/getMacAddress');
const shallowMergeObjects = require('./utils/js/shallowMergeObjects');
const { hashForUniqueId } = require('./utils/crypto');
const jsonStringifyFormatted = require('./utils/json/jsonStringifyFormatted');
const { isMac } = require('./utils/platform/platform');

console.log('node version:', process.version);

/* constants */

const configFilePath = './config.jsonc';

// default values
let webServerPort = 1413;
//let webServerRootDirPath = __dirname;  // public folder

let splashScreenDurationInMillis = 2000;

let developmentServerPort = process.env.PORT || 1234;

const appAsarInstallationPath = appDirectory.appAsarInstallationPath;
console.log(`appAsarInstallationPath: ${appAsarInstallationPath}`);
const webServerRootDirectory = appDirectory.webServerRootDirectory;
console.log(`webServerRootDirectory: ${webServerRootDirectory}`);
const webServerFilesDirectory = appDirectory.webServerFilesDirectory;
console.log(`webServerFilesDirectory: ${webServerFilesDirectory}`);

const serverProgramPath = myPath.join(__dirname, 'server', 'socketio-server.js');

/* end of constants */


/* global variables */

let mainWindow;
// https://fabiofranchino.com/blog/use-electron-as-local-webserver/
// let webServerProcess = fork(`${myPath.join(__dirname, 'server', 'easyrtc-server.js')}`);
let webServerProcess;
let paramsFromExternalConfigForReact;

/* end of global variables */


async function readConfigFileAsync(configFile) {
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
    width: 583,
    height: 333,
    resizable: false,
    movable: false,
    frame: false,
    skipTaskbar: true,
    show: false,
    transparent: true
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

  splashScreen.on('ready-to-show', async _ => {
    splashScreen.show();

    // things to do on start up
    // splashScreen will be shown when we are doing these things

    // this setTimeout is to allow time for splash screen to show
    // before the thread is being blocked by running fileSystem.extractAll() or something like that
    setTimeout(async _ => {
      console.log("splash screen");
      // delete any cached temp project files
      await ProjectFile.deleteAllTempProjectDirectoriesAsync();

      // create App Data directories if they do not exist
      await forEach(appDirectory.createOnStartUpDirectories, async (directoryPath) => {       
        console.log('Directory created:', directoryPath);
        await fileSystem.createDirectoryIfNotExistsPromise(directoryPath);        
      });
      console.log('App directories created.');

      await openWebServerAsync();

      // hide splash screen
      setTimeout(_ => {
        splashScreenCountdowned = true;

        //mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}/file-explorer` : `file://${myPath.join(__dirname, '../build/index.html')}`);
        //mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}` : `file://${myPath.join(__dirname, '../build/index.html')}`);
        mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}/projectlist` : `file://${myPath.join(__dirname, '../build/index.html')}`);

      }, splashScreenDurationInMillis);
    }, 1000);
  });

  /* main window lifecycles */

  mainWindow.on('ready-to-show', () => {
    mainWindowReady = true;
    mainWindow.show();
    splashScreen.close();
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
    click: _ => {
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
    click: _ => {
      mainWindow.reload();
    }
  }));

  // all windows of this application share same menu
  Menu.setApplicationMenu(menu);

  /* end of setting up menu for hot keys purpose only */
}


/* web server */

async function openWebServerAsync() {  
  await fileSystem.myDeletePromise(webServerFilesDirectory);
  await fileSystem.createDirectoryIfNotExistsPromise(webServerFilesDirectory);  

  webServerProcess = fork(serverProgramPath);

  console.log('Presentation port to use:', webServerPort);

  // https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
  webServerProcess.send({
    address: 'open-server',
    port: webServerPort,
    rootDirPath: webServerRootDirectory,
    filesDirPath: webServerFilesDirectory,
    webServerStaticFilesPathPrefix: config.webServerStaticFilesPathPrefix,
  });  
}

function closeWebServer() {
  if (webServerProcess) {
    webServerProcess.send({
      address: 'close-server'
    });

    console.log('Web server closed.');
  }
}

/* end of web server */


/* app lifecycles */

app.on('ready', async _ => {
  try {
    await readConfigFileAsync(configFilePath);
  } catch (err) {
    console.error('ready Error:');
    console.error(err);
  }

  createWindow();
});

app.on('window-all-closed', async _ => {
  console.log('window-all-closed');

  // delete any cached temp project files
  await ProjectFile.deleteAllTempProjectDirectoriesAsync();
  await forEach(appDirectory.deleteOnCloseDownDirectories, async (directoryPath) => {  
    console.log('Directory deleted:', directoryPath);
    await fileSystem.myDeletePromise(directoryPath);
  });
  console.log('App directories deleted.');

  // Always check if web server is closed when all windows are closed
  closeWebServer();

  // TODO: Rationale behind isMac check:
  // In mac, when all windows are closed, the app does not necessarily quit.
  // But this in-mac behaviour may require Application Menu implementation as well,
  // so that a window can be opened again after all windows are closed.
  if (!isMac) {
    console.log('App quit.');
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

// config

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

// network interfaces

ipcMain.on('getMacAddress', (event, arg) => {
  getMacAddressHelper.one(function (err, mac) {
    if (err) {
      console.error('getMacAddress Error:');
      console.error(err);
      event.sender.send('getMacAddressResponse', {
        err: err.toString(),
        data: null
      });
      return;
    }

    console.log("Mac address for this host: %s", mac);
    event.sender.send('getMacAddressResponse', {
      err: null,
      data: {
        mac: mac
      }
    });
  });
});

// shell

ipcMain.on('shellOpenItem', (event, arg) => {
  const filePath = arg;
  shell.openItem(filePath);
});

ipcMain.on('shellOpenExternal', (event, arg) => {
  const url = arg;
  shell.openExternal(url);
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
  const isMaximizedOld = senderWindow.isMaximized();
  if (isMaximizedOld) {
    senderWindow.unmaximize();
  } else {
    senderWindow.maximize();
  }
  event.sender.send('toggleMaximizeResponse', {
    err: null,
    data: {
      isMaximized: !isMaximizedOld
    }
  });
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
    console.error('mimeStat error');
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
    console.error('mimeStats error');
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
    console.error('base64Encode Error:');
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
    console.error('base64Decode Error:');
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
    console.error('createPackage Error:');
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
    console.error('extractAll Error:');
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
    console.error('readdir Error:');
    console.error(err);
    event.sender.send('readdirResponse', {
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
    console.error('readFile Error:');
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
    console.error('writeFile Error:');
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
    console.error('deleteFile Error:');
    console.error(err);
    event.sender.send('deleteFileResponse', {
      err: err.toString()
    });
  }
});

ipcMain.on('renameFile', async (event, arg) => {
  try {
    await fileSystem.renamePromise(arg.oldPath, arg.newPath);
    event.sender.send('renameFileResponse', {
      err: null
    });
  } catch (err) {
    console.error('renameFile Error:');
    console.error(err);
    event.sender.send('renameFileResponse', {
      err: err.toString()
    });
  }
});

ipcMain.on('copyFile', async (event, arg) => {
  try {
    await fileSystem.copyFilePromise(arg.src, arg.dest);
    event.sender.send('copyFileResponse', {
      err: null
    });
  } catch (err) {
    console.error('copyFile Error:');
    console.error(err);
    event.sender.send('copyFileResponse', {
      err: err.toString()
    });
  }
});

// saveLoadProject

ipcMain.on('listProjects', async (event, arg) => {
  console.log('listProjects');
  const isLoadProjectJson = true;
  ProjectFile.listProjectsAsync(isLoadProjectJson)
    .then((projectFileObjs) => {
      event.sender.send('listProjectsResponse', {
        err: null,
        data: {
          projectFileObjs: projectFileObjs
        }
      });
    })
    .catch(err => {
      console.error('listProjects Error:');
      console.error(err);
      event.sender.send('listProjectsResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('saveProject', (event, arg) => {
  saveProjectToLocalAsync(arg.projectFilePath, arg.entitiesList, arg.assetsList)
    .then((data) => {
      event.sender.send('saveProjectResponse', {
        err: null,
        data: {
          projectJson: data
        }
      });
    })
    .catch(err => {
      console.error('saveProject Error:');
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
      console.error('parseDataToSaveFormat Error:');
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
    .then((data) => {
      event.sender.send('loadProjectByProjectFilePathResponse', {
        err: null,
        data: {
          projectJson: data
        }
      });
    })
    .catch(err => {
      console.error('loadProjectByProjectFilePath Error:');
      console.error(err);
      event.sender.send('loadProjectByProjectFilePathResponse', {
        err: err.toString(),
        data: null
      });
    });
});

ipcMain.on('isCurrentLoadedProject', (event, arg) => {
  const projectFilePath = arg;
  const isCurrentLoadedProject = ProjectFile.isCurrentLoadedProject(projectFilePath);
  event.sender.send('isCurrentLoadedProjectResponse', {
    err: null,
    data: {
      isCurrentLoadedProject: isCurrentLoadedProject
    }
  });
});

// window dialog
// call back arguments (_, filePaths) "faking" error first approach, for easy promisification

ipcMain.on('openImageDialog', (event, arg) => {
  openImageDialog((_, filePaths) => {
    event.sender.send('openImageDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openGifDialog', (event, arg) => {
  openGifDialog((_, filePaths) => {
    event.sender.send('openGifDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openVideoDialog', (event, arg) => {
  openVideoDialog((_, filePaths) => {
    event.sender.send('openVideoDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openSchoolVrFileDialog', (event, arg) => {
  openSchoolVrFileDialog((_, filePaths) => {
    event.sender.send('openSchoolVrFileDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('saveSchoolVrFileDialog', (event, arg) => {
  saveSchoolVrFileDialog((_, filePath) => {
    event.sender.send('saveSchoolVrFileDialogResponse', {
      data: {
        filePath: filePath
      }
    });
  });
});

// vanilla electron dialog

ipcMain.on('showOpenDialog', (event, arg) => {
  const options = arg;
  dialog.showOpenDialog(options, (filePaths) => {
    event.sender.send('showOpenDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('showSaveDialog', (event, arg) => {
  const options = arg;
  dialog.showOpenDialog(options, (filePath) => {
    event.sender.send('showSaveDialogResponse', {
      data: {
        filePath: filePath
      }
    });
  });
});

// show message showMessageBox

ipcMain.on('showYesNoQuestionMessageBox', (event, arg) => {
  showYesNoQuestionMessageBox(arg.message, arg.detail, (response) => {
    const btnId = response;
    event.sender.send('showYesNoQuestionMessageBoxResponse', {
      data: {
        buttonId: btnId
      }
    });
  });
});

ipcMain.on('showYesNoWarningMessageBox', (event, arg) => {
  showYesNoWarningMessageBox(arg.message, arg.detail, (response) => {
    const btnId = response;
    event.sender.send('showYesNoWarningMessageBoxResponse', {
      data: {
        buttonId: btnId
      }
    });
  });
});

// for presentation

ipcMain.on('getPresentationServerInfo', (event, arg) => {
  const interfaceIpMap = getIpAddress.getAllIps();
  event.sender.send('getPresentationServerInfoResponse', {
    data: {
      interfaceIpMap: interfaceIpMap,
      port: webServerPort
    }
  });
});

ipcMain.on('openWebServerAndLoadProject', async (event, arg) => {
  try {
    /* load project file */
    const filePath = arg;
    //console.log(`filePath: ${filePath}`);
    const projectFile = new ProjectFile(null, filePath, null);
    const hashedFilePath = projectFile.hashedSavedProjectFilePath;
    //console.log(`hashedFilePath: ${hashedFilePath}`);
    const staticAssetUrlPathPrefixForWebPresentation = myPath.join(config.webServerStaticFilesPathPrefix, hashedFilePath);
    //console.log(`staticAssetUrlPathPrefixForWebPresentation: ${staticAssetUrlPathPrefixForWebPresentation}`);
    const projectJson = await loadProjectByProjectFilePathAsync(filePath);
    //console.log(projectJson);

    // TODO: poorly written (too many cross-references to ProjectFile class)
    // add staticAssetUrlPathPrefixForWebPresentation to asset's relativeSrc
    const newlyModifiedProjectJson = Object.assign({}, projectJson);
    newlyModifiedProjectJson.assetsList.forEach((asset) => {
      const assetRelativeSrc = asset.relativeSrc;
      if (ProjectFile.isAssetPathRelative(assetRelativeSrc)) {
        asset.relativeSrc = myPath.join(staticAssetUrlPathPrefixForWebPresentation, assetRelativeSrc);
      }
    });
    /* end of load project file */

    /* open web server */
    // await openWebServerAsync();
    const externalServerDirectory = myPath.join(webServerFilesDirectory, hashedFilePath);
    await copyTempProjectDirectoryToExternalDirectoryAsync(filePath, externalServerDirectory);
    /* end of open web server */

    event.sender.send('openWebServerAndLoadProjectResponse', {
      err: null,
      data: {
        projectJson: newlyModifiedProjectJson
      }
    });
  } catch (err) {
    console.error('openWebServerAndLoadProject Error:')
    console.error(err);
    event.sender.send('openWebServerAndLoadProjectResponse', {
      err: err.toString(),
      data: null
    });
  }
});

ipcMain.on('closeWebServer', (event, arg) => {
  closeWebServer();
  event.sender.send('closeWebServerResponse', {
    err: null
  });
});

// customized app data

const getCustomizedAppDataObjFromFilePromise = async _ => {
  const appDataFileContent = await fileSystem.readFilePromise(appDirectory.customizedAppDataFile);
  return JSON.parse(appDataFileContent);
};

const mergeAndSetCustomizedAppDataObjToFilePromise = async (objToMerge) => {
  let existingObj = {};
  try {
    existingObj = await getCustomizedAppDataObjFromFilePromise();
  } catch (err) {
    console.error('mergeAndSetCustomizedAppDataObjToFilePromise Error:');
    console.error(err);
    // silense customize app data file not existing error
  }
  const mergedObj = shallowMergeObjects(existingObj, objToMerge);
  const mergedObjStr = jsonStringifyFormatted(mergedObj);
  await fileSystem.writeFilePromise(appDirectory.customizedAppDataFile, mergedObjStr);
}

ipcMain.on('getCustomizedAppData', async (event, arg) => {
  try {
    const appDataObj = await getCustomizedAppDataObjFromFilePromise();
    const appDataObjStr = JSON.stringify(appDataObj);
    event.sender.send('getCustomizedAppDataResponse', {
      err: null,
      data: {
        appDataObjStr: appDataObjStr
      }
    });
  } catch (err) {
    console.error('getCustomizedAppData Error:');
    console.error(err);
    event.sender.send('getCustomizedAppDataResponse', {
      err: err.toString(),
      data: null
    });
  }
});

ipcMain.on('setCustomizedAppData', async (event, arg) => {
  try {
    await mergeAndSetCustomizedAppDataObjToFilePromise(JSON.parse(arg.appDataObjStr));
    event.sender.send('setCustomizedAppDataResponse', {
      err: null
    });
  } catch (err) {
    console.error('setCustomizedAppData Error:');
    console.error(err);
    event.sender.send('setCustomizedAppDataResponse', {
      err: err.toString()
    });
  }
});

function getEvenIdxOfStr(str) {
  if (!str) {
    return '';
  }
  const chars = str.split('');
  const evenChars = chars.filter((_, idx) => idx % 2 === 0);
  return evenChars.join();
}

const identityKeySpecialDelimiter = ':::::'

const encodeIdentityKeyPromise = async (licenseKey) => {
  const macAddress = await getMacAddressPromiseHelper.one();
  return licenseKey + identityKeySpecialDelimiter
    + hashForUniqueId(licenseKey + getEvenIdxOfStr(macAddress));
};

const decodeIdentityKeyPromise = async _ => {
  const appDataObj = await getCustomizedAppDataObjFromFilePromise();
  const identityKey = appDataObj.identityKey;

  if (!identityKey) {
    return null;
  }

  const identityKeySplitted = identityKey.split(identityKeySpecialDelimiter);

  if (identityKeySplitted.length !== 2) {
    return null;
  }

  const licenseKey = identityKeySplitted[0];
  return { identityKey, licenseKey };
};

ipcMain.on('checkIdentity', async (event, arg) => {
  let isIdentityValid = false;
  try {
    const decodeIdentityKeyObj = await decodeIdentityKeyPromise();
    if (decodeIdentityKeyObj) {
      const { identityKey, licenseKey } = decodeIdentityKeyObj;
      const supposedIdentityKey = await encodeIdentityKeyPromise(licenseKey);
      isIdentityValid = supposedIdentityKey === identityKey;
    }
  } catch (err) {
    console.error('checkIdentity Error:');
    console.error(err);
    // silense error
  }
  event.sender.send('checkIdentityResponse', {
    err: null,
    data: {
      isIdentityValid: isIdentityValid
    }
  });
});

ipcMain.on('setLicenseKey', async (event, arg) => {
  try {
    const licenseKeyInput = arg.licenseKey;
    const identityKey = licenseKeyInput ? (await encodeIdentityKeyPromise(licenseKeyInput)) : '';
    await mergeAndSetCustomizedAppDataObjToFilePromise({
      identityKey: identityKey
    });
    event.sender.send('setLicenseKeyResponse', {
      err: null
    });
  } catch (err) {
    console.error('setLicenseKey Error:');
    console.error(err);
    event.sender.send('setLicenseKeyResponse', {
      err: err.toString()
    });
  }
});

// 360 capture

ipcMain.on('saveRaw360Capture', async (event, arg) => {
  // use let because I will have to use tmpImg in finally block
  let tmpImgFilePath;  
  const imgBase64Str = arg.imgBase64Str;

  try {
    tmpImgFilePath = await write360ImageToTempPromise(imgBase64Str);
    const filePathToSave = await save360ImageDialogPromise();

    console.log('tmpImgFilePath:', tmpImgFilePath);

    if (!filePathToSave) {
      event.sender.send('saveRaw360CaptureResponse', {
        err: null,
        data: null
      });
      return;
    }

    await fileSystem.renamePromise(tmpImgFilePath, filePathToSave);
    event.sender.send('saveRaw360CaptureResponse', {
      err: null,
      data: {
        filePath: filePathToSave
      }
    });
  } catch (err) {
    console.error('saveRaw360Capture Error:');
    console.error(err);
    event.sender.send('saveRaw360CaptureResponse', {
      err: err.toString()
    });
  } finally {
  //   if (tmpImgFilePath) {
  //     const tmpImgDirPath = myPath.dirname(tmpImgFilePath);
  //     fileSystem.myDelete(tmpImgDirPath, (err) => {
  //       if (err) { 
  //         // silence error
  //         console.error('saveRaw360Capture deleting temp image Error:');
  //         console.error(err);
  //       }
  //     });
  //   }
  }
});

ipcMain.on('saveRaw360CaptureForVideo', async (event, arg) => {
  // use let because I will have to use tmpImg in finally block
  let tmpImgFilePath;
  const videoUuid = arg.videoUuid;
  const fps = arg.fps;
  const currentFrame = arg.currentFrame;
  const totalFrame = arg.totalFrame;
  const imgBase64Str = arg.imgBase64Str;

  /**
   * if totalFrame is 30,
   * then currentFrame ranges from 0 to 30.
   * i.e. total number of frames is 30
   */

  const isLastFrame = currentFrame === totalFrame;

  try {
    tmpImgFilePath = await write360ImageAsPartOfVideoToTempPromise(videoUuid, currentFrame, imgBase64Str);

    if (isLastFrame) {
      await convertTempImageSequenceToVideoPromise(videoUuid, fps);
    }

    // const filePathToSave = await save360ImageDialogPromise();

    // console.log('tmpImgFilePath:', tmpImgFilePath);

    // if (!filePathToSave) {
    //   event.sender.send('saveRaw360CaptureForVideoResponse', {
    //     err: null,
    //     data: null
    //   });
    //   return;
    // }

    // await fileSystem.renamePromise(tmpImgFilePath, filePathToSave);
    // event.sender.send('saveRaw360CaptureForVideoResponse', {
    //   err: null,
    //   data: {
    //     filePath: filePathToSave
    //   }
    // });
  } catch (err) {
    console.error('saveRaw360CaptureForVideo Error:');
    console.error(err);
    event.sender.send('saveRaw360CaptureForVideoResponse', {
      err: err.toString()
    });
  } finally {
    // if (tmpImgFilePath) {
    //   const tmpImgDirPath = myPath.dirname(tmpImgFilePath);
    //   fileSystem.myDelete(tmpImgDirPath, (err) => {
    //     if (err) { 
    //       // silence error
    //       console.error('saveRaw360Capture deleting temp image Error:');
    //       console.error(err);
    //     }
    //   });
    // }
  }
});

/* end of ipc main event listeners */