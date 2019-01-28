import fileSystem from 'utils/fileSystem';
import getExistingProjectNames from './getExistingProjectNames';

const isProjectExist = (projectNameToCheck, callBack) => {
  getExistingProjectNames((err, existingProjectNames) => {
    if (err) {
      fileSystem.handleGeneralErr(callBack, err);
    } else {
      const isTheNamedProjectExist = existingProjectNames.includes(projectNameToCheck);
      fileSystem.handleGeneralErrAndData(callBack, err, isTheNamedProjectExist);
    }
  });
}

export default isProjectExist;