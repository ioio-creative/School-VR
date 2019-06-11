const ProjectFile = require('./ProjectFile');
const fileSystem = require('../fileSystem/fileSystem');


const loadProjectByProjectFilePathAsync = async (projectFilePath, isKeepAssetPathsRelative = false) => {  
  const projectJson = await ProjectFile.loadProjectByFilePathAsync(projectFilePath, isKeepAssetPathsRelative);
  return projectJson;
};

const copyTempProjectDirectoryToExternalDirectoryAsync = async (projectFilePath, externalDirectoryPath) => {
  const projectFile = new ProjectFile(null, projectFilePath, null);
  await fileSystem.copyPromise(projectFile.tempProjectDirectoryPath, externalDirectoryPath);
};


module.exports = {
  loadProjectByProjectFilePathAsync,
  copyTempProjectDirectoryToExternalDirectoryAsync
};