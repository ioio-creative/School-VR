import ipcHelper from 'utils/ipc/ipcHelper';
import shallowMergeObjects from 'utils/js/shallowMergeObjects';
import promisify from 'utils/js/myPromisify';

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

const getCustomizedAppDataPromise = promisify(getCustomizedAppDataAsync);

const setCustomizedAppDataAsync = (dataObj, callBack) => {
  if (!customizedAppDataObj) {
    customizedAppDataObj = dataObj;
  } else {
    customizedAppDataObj = shallowMergeObjects(customizedAppDataObj, dataObj);
  }

  const appDataObjStr = JSON.stringify(customizedAppDataObj);
  ipcHelper.setCustomizedAppData(appDataObjStr, (err) => {
    if (err) {
      callBack(err);
      return;
    }

    callBack(null);
  });
};

const setCustomizedAppDataPromise = promisify(setCustomizedAppDataAsync);


export {
  getCustomizedAppDataAsync,
  getCustomizedAppDataPromise,
  setCustomizedAppDataAsync,
  setCustomizedAppDataPromise
}