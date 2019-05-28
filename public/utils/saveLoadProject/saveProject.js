const ProjectFile = require('./ProjectFile');


const saveProjectToLocalAsync = async (projectName, entitiesList, assetsList) => {
  const project = new ProjectFile(projectName);
  return await project.saveToLocalAsync(entitiesList, assetsList);
};


module.exports = {
  saveProjectToLocalAsync
};