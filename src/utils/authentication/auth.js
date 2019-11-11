import config from 'globals/config';
import ipcHelper from 'utils/ipc/ipcHelper';

// https://tylermcginnis.com/react-router-protected-routes-authentication/
let isAuthenticated = false;

const checkMacAddress = mac => {
  return ['f8:28:19:ef:23:c3'].includes(mac);
}

const checkIdentity = callBack => {
  let isIdentityValid = false;

  if (!config.isElectronApp) {
    isIdentityValid = true;
    callBack(isIdentityValid);
    return;
  }

  ipcHelper.getMacAddress((err, data) => {
    if (err) {
      callBack(isIdentityValid);
      return;
    }

    isIdentityValid = checkMacAddress(data.mac);
    callBack(isIdentityValid);
  })
};

const authenticate = (callBack) => {
  checkIdentity(isIdentityValid => {
    isAuthenticated = isIdentityValid;
    callBack(isAuthenticated);
  });
};

const signout = (callBack) => {
  isAuthenticated = false;
  setTimeout(callBack, 100);  // fake async
};

const getIsAuthenticated = _ => {
  return isAuthenticated;
}

export {
  authenticate,
  signout,
  getIsAuthenticated
};