const ipcMain = require('electron').ipcMain;

let mainWindow;

exports.registerMainWindowToIpcMain = (mainWin) => {
  mainWindow = mainWin;
};

exports.deregisterMainWindowFromIpcMain = () => {
  mainWindow = null;
}

// ipc.on('invokeAction', function(event, data){
//     var result = processData(data);
//     event.sender.send('actionReply', result);
// });

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