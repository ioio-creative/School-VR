const config = {}
try {
  const electron = window.require('electron');
  const remote = electron.remote;
  const { app } = remote;
  
  const path = window.require('path');
  
  const appName = app.getName();

  config['appName'] = appName;   
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname  
  config['appDataDirectory'] = path.join(app.getPath('documents'), `${appName}-Data`);   
  config['appTempWorkingDirectory'] = path.join(app.getPath('appData'), `${appName}-Temp`);   
  config['schoolVrProjectArchiveExtensionWithLeadingDot'] = '.iar';   
} catch(e) {
  config['appName'] = 'School VR';   
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname  
  // config['appDataDirectory'] = path.join(app.getPath('documents'), `${appName}-Data`);   
  // config['appTempWorkingDirectory'] = path.join(app.getPath('appData'), `${appName}-Temp`);   
  // config['schoolVrProjectArchiveExtensionWithLeadingDot'] = '.iar';   
}

export default config;