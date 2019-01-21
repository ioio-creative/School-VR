import fileSystem from 'utils/fileSystem';
import getExistingProjectNames from './getExistingProjectNames';
import {getCurrentLoadedProjectName} from './loadProject';

const isProjectNameUsed = (nameToCheck, callBack) => {  
  getExistingProjectNames((err, existingProjectNames) => {
    if (err) {
      fileSystem.handleGeneralErr(callBack, err);
    } else {
      const currentLoadedProjectName = getCurrentLoadedProjectName();
      const isNameUsed = (nameToCheck !== currentLoadedProjectName) && existingProjectNames.includes(nameToCheck);
      fileSystem.handleGeneralErrAndData(callBack, err, isNameUsed);
    }
  });
}

export default isProjectNameUsed;
