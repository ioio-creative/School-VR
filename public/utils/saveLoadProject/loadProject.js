const ProjectFile = require('./ProjectFile');


const loadProjectByProjectFilePathAsync = async (projectFilePath) => {
  const projectFile = new ProjectFile(null, projectFilePath, null);
  const projectJson = await projectFile.loadProjectByFilePathAsync();
  return projectJson;
};


module.exports = {
  loadProjectByProjectFilePathAsync
};