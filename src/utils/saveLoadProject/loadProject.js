import {
  getTempProjectDirectoryPath,
  getSavedProjectFilePath
} from './getProjectPaths';
import fileSystem from 'utils/fileSystem/fileSystem';


let currentLoadedProjectName = undefined;

// const getCurrentLoadedProjectName = () => {
//   return currentLoadedProjectName;
// };

// Note: may not be good idea to expose this method
// but it's used in saveProjectToLocal.js
const setCurrentLoadedProjectName = (aProjectName) => {
  currentLoadedProjectName = aProjectName;
};

const isCurrentLoadedProject = (aProjectName) => {
  return currentLoadedProjectName === aProjectName;
};

const loadProjectAsync = async (projectName) => {
  setCurrentLoadedProjectName(projectName);

  const savedProjectFilePath = getSavedProjectFilePath(projectName);
  const tempProjectDirectoryPath = getTempProjectDirectoryPath(projectName);

  fileSystem.extractAll(savedProjectFilePath, tempProjectDirectoryPath);
  console.log(`loadProject - loadProjectAsync: Project extracted to ${tempProjectDirectoryPath}`);
}

export {
  //getCurrentLoadedProjectName,
  setCurrentLoadedProjectName,
  isCurrentLoadedProject,
  loadProjectAsync
};
