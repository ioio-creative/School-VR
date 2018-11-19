const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;

const path = require('path');
//const url = require('url');
const isDev = require('electron-is-dev');

const {registerMainWindowToIpcMain, deregisterMainWindowFromIpcMain} = require('./js/ipcMain.js');

let mainWindow;

function createWindow() {
  const Menu = electron.Menu;
  const MenuItem = electron.MenuItem;


  /* setting up mainWindow */  

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 810,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    transparent: true
  });

  //mainWindow.loadURL(isDev ? 'http://localhost:3000/file-explorer' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  
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

app.on('ready', createWindow);

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
