import fileSystem from 'utils/fileSystem/fileSystem';
import getExistingProjectNames from './getExistingProjectNames';
import {isCurrentLoadedProject} from './loadProject';

const isProjectNameUsed = (nameToCheck, callBack) => {  
  getExistingProjectNames((err, existingProjectNames) => {
    if (err) {
      fileSystem.handleGeneralErr(callBack, err);
    } else {      
      const isNameUsed = !isCurrentLoadedProject(nameToCheck) && existingProjectNames.includes(nameToCheck);
      fileSystem.handleGeneralErrAndData(callBack, err, isNameUsed);
    }
  });
}

export default isProjectNameUsed;
