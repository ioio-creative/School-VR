import ipcHelper from 'utils/ipc/ipcHelper';
import shallowMergeObjects from 'utils/js/shallowMergeObjects';
import promisify from 'utils/js/myPromisify';


const getCustomizedAppDataAsync = callBack => {
  ipcHelper.getCustomizedAppData((err, appDataObj) => {
    if (err) {
      // silence error
      callBack(null, null);
      return;
    }

    callBack(null, appDataObj || {});
  });
};

const getCustomizedAppDataPromise = promisify(getCustomizedAppDataAsync);


const setCustomizedAppDataAsync = (dataObj, callBack) => {
  ipcHelper.setCustomizedAppData(dataObj, (err) => {
    if (err) {
      callBack(err);
      return;
    }

    callBack(null);
  });
};

const setCustomizedAppDataPromise = promisify(setCustomizedAppDataAsync);

const setCustomizedAppDataLangCodeAsync = (langCode, callBack) => {
  setCustomizedAppDataAsync({ langCode }, callBack);
};

const setCustomizedAppDataLangCodePromise = promisify(setCustomizedAppDataLangCodeAsync);


export {
  getCustomizedAppDataAsync,
  getCustomizedAppDataPromise,

  setCustomizedAppDataAsync,
  setCustomizedAppDataPromise,
  setCustomizedAppDataLangCodeAsync,
  setCustomizedAppDataLangCodePromise
}