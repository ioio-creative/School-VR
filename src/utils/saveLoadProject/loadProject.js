import {
  getTempProjectDirectoryPath,
  getTempProjectJsonFilePath,
  getSavedProjectFilePath,  
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

const loadProjectByProjectNameAsync = async (projectName) => {
  setCurrentLoadedProjectName(projectName);

  const savedProjectFilePath = getSavedProjectFilePath(projectName);
  const tempProjectDirectoryPath = getTempProjectDirectoryPath(projectName);

  fileSystem.extractAll(savedProjectFilePath, tempProjectDirectoryPath);
  console.log(`loadProject - loadProjectAsync: Project extracted to ${tempProjectDirectoryPath}`);

  const projectJsonStr = await fileSystem.readFileSync(getTempProjectJsonFilePath(projectName));
  return JSON.stringify(projectJsonStr);
};

const loadProjectByProjectFilePathAsync = async (projectFilePath) => {
  return await loadProjectByProjectNameAsync(fileSystem.getFileNameWithoutExtension(projectFilePath));
};

export {
  //getCurrentLoadedProjectName,
  setCurrentLoadedProjectName,
  isCurrentLoadedProject,
  loadProjectByProjectNameAsync,
  loadProjectByProjectFilePathAsync
};
