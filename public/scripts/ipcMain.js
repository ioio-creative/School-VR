const electron = require('electron');
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;


/* global variables */

let mainWindow;
let paramsFromExternalConfigForReact;

/* end of global variables */


exports.registerMainWindowToIpcMain = (mainWin) => {
  mainWindow = mainWin;
};

exports.deregisterMainWindowFromIpcMain = () => {
  mainWindow = null;
};

exports.setParamsFromExternalConfigForReact = (params) =>{
  paramsFromExternalConfigForReact = params;
};


/* helpers */

function getSenderWindowFromEvent(ipcEvent) {  
  return BrowserWindow.fromWebContents(ipcEvent.sender);
}

/* end of helpers */


/* ipc main event listeners */

// ipc.on('invokeAction', (event, arg) => {
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

/* end of ipc main event listeners */