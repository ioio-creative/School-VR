import config from 'globals/config';
import ipcHelper from 'utils/ipc/ipcHelper';

// https://tylermcginnis.com/react-router-protected-routes-authentication/
let isAuthenticated = false;
let currentMacAddress;

const getMacAddressPromise = async _ => {
  if (!currentMacAddress) {
    currentMacAddress = await ipcHelper.getMacAddressPromise();
  }
  return currentMacAddress;
};

const checkMacAddressAndLicenseKeyOnCloudPromise = (mac, licenseKey) => {
  return new Promise((resolve, reject) => {
    setTimeout(_ => {
      const isIdentityValid = ['f8:28:19:ef:23:c3', '18:a6:f7:0d:fc:89'].includes(mac) && licenseKey === 'askmeioio';
      resolve(isIdentityValid);
    }, 1000);  // fake async
  });
}

// return boolean indicating isIdentityValid
const checkIdentityPromise = async (licenseKeyEntered) => {
  // if it's electron app, return true
  if (!config.isElectronApp) {
    return true;
  }

  // check identity by checking local files
  const { isIdentityValid: isIdentityValidCheckResultFromLocalFiles } = await ipcHelper.checkIdentityPromise();

  // if local file check is positive, return true
  if (isIdentityValidCheckResultFromLocalFiles) {
    return true;
  }

  // if local file check is negative, have to check on cloud
  // by sending licenseKeyEntered and macAddress to cloud api

  // if no license key is input, return false
  if (!licenseKeyEntered) {
    return false;
  }

  const { mac: macAddress } = await getMacAddressPromise();

  const isIdentityValidCheckResultFromCloud = await checkMacAddressAndLicenseKeyOnCloudPromise(macAddress, licenseKeyEntered);

  // save license key to local files,
  // set empty string meaning erasing license key record in local files
  let licenseKeyToSetToLocalFile = isIdentityValidCheckResultFromCloud ? licenseKeyEntered : '';
  ipcHelper.setLicenseKeyPromise(licenseKeyToSetToLocalFile);

  return isIdentityValidCheckResultFromCloud;
}

const authenticatePromise = async _ => {
  isAuthenticated = await checkIdentityPromise(null);
  return isAuthenticated;
};

const authenticateWithLicenseKeyPromise = async (licenseKeyEntered) => {
  isAuthenticated = await checkIdentityPromise(licenseKeyEntered);
  return isAuthenticated;
};

const signoutPromise = new Promise((resolve, reject) => {
  isAuthenticated = false;
  setTimeout(_ => {
    resolve();
  }, 1000);  // fake async
});

const getIsAuthenticated = _ => {
  return isAuthenticated;
}

export {
  authenticatePromise,
  authenticateWithLicenseKeyPromise,
  signoutPromise,
  getIsAuthenticated
};