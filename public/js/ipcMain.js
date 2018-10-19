const ipc = require("electron").ipcMain;

exports.setUpIpcMain = () => {
  ipc.on("FileWrite", (event, arg) =>{
    console.log(arg);
  });
};