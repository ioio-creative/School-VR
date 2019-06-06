const ProjectFile = require('./ProjectFile');


const loadProjectByProjectFilePathAsync = async (projectFilePath) => {  
  const projectJson = await ProjectFile.loadProjectByFilePathAsync(projectFilePath);
  return projectJson;
};


module.exports = {
  loadProjectByProjectFilePathAsync
};