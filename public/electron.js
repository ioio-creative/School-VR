const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const globalShortcut = electron.globalShortcut;

const path = require('path');
//const url = require('url');
const isDev = require('electron-is-dev');

const { setUpIpcMain } = require('./js/ipcMain.js');


setUpIpcMain();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 810,
    frame: false,
    transparent: true
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000/file-explorer' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);

  mainWindow.webContents.openDevTools();
  
  // https://electronjs.org/docs/tutorial/keyboard-shortcuts
  // const ret = globalShortcut.register('F5', () => {
  //   mainWindow.reload();
  // })
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