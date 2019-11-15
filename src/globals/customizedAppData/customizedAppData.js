import ipcHelper from 'utils/ipc/ipcHelper';
import shallowMergeObjects from 'utils/js/shallowMergeObjects';

let customizedAppDataObj;

const getCustomizedAppDataAsync = callBack => {
  if (customizedAppDataObj) {
    callBack(null, customizedAppDataObj);
    return;
  }

  ipcHelper.getCustomizedAppData((err, data) => {
    if (err) {
      // silence error
      callBack(null, null);
      return;
    }

    callBack(null, data);
  });
};

const setCustomizedAppDataAsync = (dataObj, callBack) => {
  if (!customizedAppDataObj) {
    customizedAppDataObj = dataObj;
  } else {
    customizedAppDataObj = shallowMergeObjects(customizedAppDataObj, dataObj);
  }

  const stringifiedAppDataObj = JSON.stringify(customizedAppDataObj);
  ipcHelper.setCustomizedAppData(stringifiedAppDataObj, (err) => {
    if (err) {
      callBack(err);
      return;
    }

    callBack(null);
  });
};


const getLicenseKeyAsync = callBack => {
  getCustomizedAppDataAsync((err, data) => {
    if (err || !data) {
      // silence error
      callBack(null, null);
      return;
    }

    callBack(null, data.licenseKey);
  })
}

const setLicenseKeyAsync = (licenseKey, callBack) => {
  setCustomizedAppDataAsync({ licenseKey }, (err) => {
    if (err) {
      callBack(err, null);
      return;
    }

    callBack(null);
  })
}

export {
  getCustomizedAppDataAsync,
  setCustomizedAppDataAsync,

  getLicenseKeyAsync,
  setLicenseKeyAsync,
}