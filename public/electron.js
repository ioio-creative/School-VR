electron = require('electron');
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
const ProjectFile = require('./utils/saveLoadProject/ProjectFile');
const { saveProjectToLocalAsync } = require('./utils/saveLoadProject/saveProject');
const { loadProjectByProjectFilePathAsync, copyTempProjectDirectoryToExternalDirectoryAsync } = require('./utils/saveLoadProject/loadProject');
const { openImageDialog, openGifDialog, openVideoDialog, openSchoolVrFileDialog, saveSchoolVrFileDialog } =
  require('./utils/aframeEditor/openFileDialog');
const { showYesNoQuestionMessageBox, showYesNoWarningMessageBox } = require('./utils/aframeEditor/showMessageBox');
const { parseDataToSaveFormat } = require('./utils/saveLoadProject/parseDataToSaveFormat');
const getIp = require("./utils/getIp");


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
      const appDirectoryKeys = Object.keys(appDirectory).filter((appDirectoryKey) => {
        return !([
          'appAsarInstallationPath',
          'webServerRootDirectory',
          'webServerFilesDirectory'
        ].includes(appDirectoryKey));
      });
      await forEach(appDirectoryKeys, async (appDirectoryKey) => {
        const directoryPath = appDirectory[appDirectoryKey];
        console.log(`${appDirectoryKey}: ${directoryPath}`);
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

  const indexHtmlPath = isDev ? myPath.join(__dirname, '../build') : webServerRootDirectory;

  webServerProcess = fork(serverProgramPath);

  // https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
  webServerProcess.send({
    address: 'open-server',
    port: webServerPort,
    rootDirPath: indexHtmlPath,
    filesDirPath: webServerFilesDirectory,
    webServerStaticFilesPathPrefix: config.webServerStaticFilesPathPrefix,
  });
}

function closeWebServer() {
  if (webServerProcess) {
    webServerProcess.send({
      address: 'close-server'
    });
  }
}

/* end of web server */


/* app lifecycles */

app.on('ready', async _ => {
  try {
    await readConfigFileAsync(configFilePath);
  } catch (err) {
    console.error(err);
  }

  createWindow();
});

app.on('window-all-closed', async _ => {
  console.log('window-all-closed');

  // delete any cached temp project files
  await ProjectFile.deleteAllTempProjectDirectoriesAsync();
  await fileSystem.myDeletePromise(webServerFilesDirectory);

  const platform = process.platform.toLowerCase();
  if (platform !== 'darwin') {
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

ipcMain.on('renameFile', async (event, arg) => {
  try {
    await fileSystem.renamePromise(arg.oldPath, arg.newPath);
    event.sender.send('renameFileResponse', {
      err: null
    });
  } catch (err) {
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
    .then((data) => {
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

ipcMain.on('openImageDialog', (event, arg) => {
  openImageDialog((filePaths) => {
    event.sender.send('openImageDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openGifDialog', (event, arg) => {
  openGifDialog((filePaths) => {
    event.sender.send('openGifDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openVideoDialog', (event, arg) => {
  openVideoDialog((filePaths) => {
    event.sender.send('openVideoDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('openSchoolVrFileDialog', (event, arg) => {
  openSchoolVrFileDialog((filePaths) => {
    event.sender.send('openSchoolVrFileDialogResponse', {
      data: {
        filePaths: filePaths
      }
    });
  });
});

ipcMain.on('saveSchoolVrFileDialog', (event, arg) => {
  saveSchoolVrFileDialog((filePath) => {
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
  const interfaceIpMap = getIp.getAllIps();
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

/* end of ipc main event listeners */