const ProjectFile = require('./ProjectFile');


const saveProjectToLocalAsync = async (projectFilePath, entitiesList, assetsList) => {  
  const project = new ProjectFile(null, projectFilePath, null);   
  return await project.saveToLocalAsync(entitiesList, assetsList);
};


module.exports = {
  saveProjectToLocalAsync
};