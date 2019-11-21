import config from 'globals/config';
import ipcHelper from 'utils/ipc/ipcHelper';
import {postAuthenticateLicensePromise} from 'utils/apis/authApi';

// https://tylermcginnis.com/react-router-protected-routes-authentication/
let isAuthenticated = false;
let currentMacAddress;

const getMacAddressPromise = async _ => {
  if (!currentMacAddress) {
    currentMacAddress = await ipcHelper.getMacAddressPromise();
  }
  return currentMacAddress;
};

const checkLicenseKeyAndMacAddressOnCloudPromise = async (licenseKey, mac) => {
  try {
    const { isAuthenticated: isIdentityValid } = await postAuthenticateLicensePromise(licenseKey, mac);
    return isIdentityValid;
  } catch (err) {
    console.error('checkLicenseKeyAndMacAddressOnCloudPromise Error:');
    console.error(err);
    // silence error
    // reject
    return false;
  }
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

  const isIdentityValidCheckResultFromCloud = await checkLicenseKeyAndMacAddressOnCloudPromise(licenseKeyEntered, macAddress);

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

// no use currently
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
  signoutPromise,  // no use currently
  getIsAuthenticated
};