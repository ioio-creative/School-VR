const platformName = process.platform.toLowerCase();
console.log('platformName:', platformName);
const isMac = platformName === 'darwin';
console.log('isMac:', isMac);

module.exports = {
  platformName,
  isMac,
};