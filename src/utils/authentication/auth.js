import config from 'globals/config';
import {getLicenseKeyAsync} from 'globals/customizedAppData/customizedAppData';
import ipcHelper from 'utils/ipc/ipcHelper';
import {promisifyForFuncThatOnlyHasCallBackAsArgument} from 'utils/js/myPromisify';

// https://tylermcginnis.com/react-router-protected-routes-authentication/
let isAuthenticated = false;
let currentMacAddress;
let currentLicenseKey;

const ipcHelperGetMacAddressPromise = promisifyForFuncThatOnlyHasCallBackAsArgument(ipcHelper.getMacAddress);

const getMacAddressPromise = async _ => {
  if (!currentMacAddress) {
    currentMacAddress = await ipcHelperGetMacAddressPromise();
  }
  return currentMacAddress;
};

const getLicenseKeyFromCustomizedAppDataPromise = promisifyForFuncThatOnlyHasCallBackAsArgument(getLicenseKeyAsync);

const getLicenseKeyPromise = async _ => {
  if (!currentLicenseKey) {
    currentLicenseKey = await getLicenseKeyFromCustomizedAppDataPromise();
  }
  return currentLicenseKey;
}

const checkMacAddressAndLicenseKeyPromise = (mac, licenseKey) => {
  return new Promise((resolve, reject) => {
    setTimeout(_ => {
      const isIdentityValid = ['f8:28:19:ef:23:c3', '18:a6:f7:0d:fc:89'].includes(mac) && licenseKey === 'askmeioio';
      resolve(isIdentityValid);
    }, 1000);  // fake async
  });
}

const checkIdentityPromise = async (licenseKeyEntered) => {
  let isIdentityValid = false;

  if (!config.isElectronApp) {
    isIdentityValid = true;
    return isIdentityValid;
  }

  const macAddressPromise = getMacAddressPromise();
  const licenseKeyPromise = licenseKeyEntered ?
    new Promise((resolve, reject) => { resolve(licenseKeyEntered); }) : getLicenseKeyPromise();

  const [macAddressData, licenseKey] = await Promise.all([macAddressPromise, licenseKeyPromise]);
  const macAddress = macAddressData.mac;

  return await checkMacAddressAndLicenseKeyPromise(macAddress, licenseKey);
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