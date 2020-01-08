const platformName = process.platform.toLowerCase();
const isMac = platformName === 'darwin';


module.export = {
  platformName,
  isMac,
};