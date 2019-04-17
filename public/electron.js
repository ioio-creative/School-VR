const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;

const path = require('path');
//const url = require('url');
const isDev = require('electron-is-dev');
const {fork} = require('child_process');

const {registerMainWindowToIpcMain, deregisterMainWindowFromIpcMain} = require('./scripts/ipcMain.js');


/* constants */

const webServerPort = 9990;
const webServerRootDirPath = __dirname;  // public folder

/* end of constants */


/* global variables */

let mainWindow;
// https://fabiofranchino.com/blog/use-electron-as-local-webserver/
let webServerProcess = fork(`${__dirname}/server.js`);

/* end of global variables */


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
  })
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
  //mainWindow.loadURL(isDev ? 'http://localhost:1234/file-explorer' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.loadURL(isDev ? 'http://localhost:1234' : `file://${path.join(__dirname, '../build/index.html')}`);
  //mainWindow.loadURL(isDev ? 'http://localhost:1234/projectlist' : `file://${path.join(__dirname, '../build/index.html')}`);
  
  mainWindow.on('ready-to-show', () => {
    mainWindowReady = true;
    showMainWindow();
  });

  splashScreen.on('ready-to-show', () => {
    splashScreen.show();
    setTimeout(_=>{
      splashScreenCountdowned = true;
      showMainWindow();
    }, 5000);
  });

  function showMainWindow() {
    if (mainWindowReady && splashScreenCountdowned) {
      mainWindow.show();
      splashScreen.close();
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    deregisterMainWindowFromIpcMain();
  });    

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximize');
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('unmaximize');
  });

  registerMainWindowToIpcMain(mainWindow);

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