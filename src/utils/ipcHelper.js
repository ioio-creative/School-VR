const electron = window.require ? window.require('electron') : null;
const ipc = electron ? electron.ipcRenderer : null;



const saveProject = (projectName, entitiesList, assetsList, callBack) => {
  ipc.once('saveProjectResponse', (event, arg) => {
    callBack(arg.err, arg.data);
  });
  ipc.send('saveProject', {
    projectName: projectName,
    entitiesList: entitiesList,
    assetsList: assetsList
  });
}


export default {
  saveProject
};