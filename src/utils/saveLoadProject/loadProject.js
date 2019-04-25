import fileSystem from 'utils/fileSystem/fileSystem';
import ProjectFile from './ProjectFile';


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
  const projectFile = new ProjectFile(projectName);
  return await projectFile.loadProjectByNameAsync();
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