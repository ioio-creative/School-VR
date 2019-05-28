const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;

const path = require('path');
//const url = require('url');
const isDev = require('electron-is-dev');
const {fork} = require('child_process');
const fs = require('fs');

const jsoncParser = require('jsonc-parser');


/* constants */

const configFilePath = './config.jsonc';

// default values
let webServerPort = 1413;
let webServerRootDirPath = __dirname;  // public folder

let splashScreenDurationInMillis = 2000;

let developmentServerPort = process.env.PORT || 1234;

/* end of constants */


/* global variables */

let mainWindow;
// https://fabiofranchino.com/blog/use-electron-as-local-webserver/
let webServerProcess = fork(`${path.join(__dirname, 'server.js')}`);
let paramsFromExternalConfigForReact;

/* end of global variables */


// default text file
const defaultReadFileOptions = {
  encoding: 'utf8',
  flag: 'r'
};

function readConfigFile(configFile) {
  fs.readFile(configFile,  defaultReadFileOptions, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    try {      
      const configObj = jsoncParser.parse(data);
      const configObjForElectron = configObj.electron;
      paramsFromExternalConfigForReact = configObj.react;      

      // set some global variables
      developmentServerPort = configObjForElectron.developmentServerPort || developmentServerPort;

      webServerPort = configObjForElectron.webServerPort || webServerPort;
      webServerRootDirPath = configObjForElectron.webServerRootDirPath || webServerRootDirPath;      

      splashScreenDurationInMillis = configObjForElectron.splashScreenDurationInMillis || splashScreenDurationInMillis;      
    } catch (err) {
      console.error(err);
    }    
  });
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

  splashScreen.loadURL(`file://${path.join(__dirname, 'splash.html')}`);
  //mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}/file-explorer` : `file://${path.join(__dirname, '../build/index.html')}`);
  //mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}` : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.loadURL(isDev ? `http://localhost:${developmentServerPort}/projectlist` : `file://${path.join(__dirname, '../build/index.html')}`);
  
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

function startWebServer() {
  // https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
  webServerProcess.send({
    address: 'create-server',
    port: webServerPort,
    rootDirPath: webServerRootDirPath
  });
}


/* app lifecycles */

app.on('ready', _ => {
  readConfigFile(configFilePath);

  startWebServer();
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

function getSenderWindowFromEvent(ipcEvent) {  
  return BrowserWindow.fromWebContents(ipcEvent.sender);
}

// ipcMain.on('invokeAction', (event, arg) => {
//   const result = processData(data);
//   event.sender.send('actionReply', result);
// });

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


ipcMain.on('reactAppLoaded', (event, arg) => {
  if (arg === true) {    
    event.sender.send('setParamsFromExternalConfig', paramsFromExternalConfigForReact);
  }
});


ipcMain.on('saveProject', (event, arg) => {
  saveProjectToLocalAsync(arg.projectName, arg.entitiesList, arg.assetsList)
    .then((data) => {
      const projectJson = data.projectJson;      
      ipcMain.send('saveProjectResponse', {
        err: null,
        data: {
          projectJson: projectJson
        }
      });
    })
    .catch(err => {
      ipcMain.send('saveProjectResponse', {
        err: err,
        data: null
      });
    });
});

/* end of ipc main event listeners */