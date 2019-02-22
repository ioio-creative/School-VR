import {
  getTempProjectDirectoryPath,
  getTempProjectJsonFilePath,
  getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative,
  getSavedProjectFilePath  
} from './getProjectPaths';
import fileSystem from 'utils/fileSystem/fileSystem';
import deleteAllTempProjectDirectoriesAsync from 'utils/saveLoadProject/deleteAllTempProjectDirectoriesAsync';


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
  await deleteAllTempProjectDirectoriesAsync();

  setCurrentLoadedProjectName(projectName);

  const savedProjectFilePath = getSavedProjectFilePath(projectName);
  const tempProjectDirectoryPath = getTempProjectDirectoryPath(projectName);

  fileSystem.extractAll(savedProjectFilePath, tempProjectDirectoryPath);
  console.log(`loadProject - loadProjectByProjectNameAsync: Project extracted to ${tempProjectDirectoryPath}`);

  const projectJsonStr = await fileSystem.readFilePromise(getTempProjectJsonFilePath(projectName));
  //console.log(projectJsonStr);
  console.log(`loadProject - loadProjectByProjectNameAsync: Project ${projectName} json loaded.`);
  
  const projectJson = JSON.parse(projectJsonStr);
  
  // change any relative file path in assets to absolute path
  const assetsList = projectJson.assets_list;
  assetsList.forEach((asset) => {
    asset.src = 
      getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(projectName, asset.src);
  });

  return projectJson;
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
