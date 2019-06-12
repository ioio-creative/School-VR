const ProjectFile = require('./ProjectFile');
const fileSystem = require('../fileSystem/fileSystem');


const loadProjectByProjectFilePathAsync = async (projectFilePath, staticAssetUrlPathPrefixForWebPresentation = null) => {  
  const projectJson = await ProjectFile.loadProjectByFilePathAsync(projectFilePath, staticAssetUrlPathPrefixForWebPresentation);
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