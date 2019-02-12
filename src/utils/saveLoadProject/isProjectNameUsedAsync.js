import getExistingProjectNamesAsync from './getExistingProjectNamesAsync';
import {isCurrentLoadedProject} from './loadProject';

const isProjectNameUsedAsync = async (nameToCheck) => {  
  const existingProjectNames = await getExistingProjectNamesAsync(existingProjectNames);
  const isNameUsed = !isCurrentLoadedProject(nameToCheck) && existingProjectNames.includes(nameToCheck);
  return isNameUsed;
}

export default isProjectNameUsedAsync;
