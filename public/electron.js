const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;

const path = require('path');
//const url = require('url');
const isDev = require('electron-is-dev');

const { setUpIpcMain } = require('./js/ipcMain.js');

// ipc.on('invokeAction', function(event, data){
//     var result = processData(data);
//     event.sender.send('actionReply', result);
// });

setUpIpcMain();

let mainWindow;

function createWindow() {
  const ipcMain = electron.ipcMain;
  const Menu = electron.Menu;
  const MenuItem = electron.MenuItem;

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
  mainWindow.on('closed', () => mainWindow = null);

  
  
  // https://electronjs.org/docs/tutorial/keyboard-shortcuts
  // const ret = globalShortcut.register('F5', () => {
  //   mainWindow.reload();
  // })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximize');
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('unmaximize');
  })

  ipcMain.on('toggleMaximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  })

  ipcMain.on('toggleDevTools', () => {
    mainWindow.webContents.toggleDevTools();
  })

  const menu = new Menu()

  menu.append(new MenuItem({
    label: 'Toggle DevTools',
    accelerator: 'F12',
    click: () => { 
      mainWindow.webContents.toggleDevTools();
    }
  }))
  menu.append(new MenuItem({
    label: 'Refresh',
    accelerator: 'F5',
    click: () => { 
      mainWindow.reload();
    }
  }))

  Menu.setApplicationMenu(menu);
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