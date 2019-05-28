const ProjectFile = require('./ProjectFile');


let currentLoadedProjectFilePath = null;


// Note: may not be good idea to expose this method
// but it's used in saveProjectToLocal.js
const setCurrentLoadedProjectFilePath = (projectFilePath) => {
  currentLoadedProjectFilePath = projectFilePath;
};

const isCurrentLoadedProject = (aFilePath) => {
  return currentLoadedProjectFilePath === aFilePath;
};

const loadProjectByProjectFilePathAsync = async (projectFilePath) => {
  setCurrentLoadedProjectFilePath(projectFilePath);
  const projectFile = new ProjectFile(null, projectFilePath, null);
  const projectJson = await projectFile.loadProjectByFilePathAsync();
  return projectJson;
};

const loadCurrentLoadedProjectAsync = async () => {
  return await loadProjectByProjectFilePathAsync(currentLoadedProjectFilePath);
};


module.exports = {
  setCurrentLoadedProjectFilePath,
  isCurrentLoadedProject,  
  loadProjectByProjectFilePathAsync,
  loadCurrentLoadedProjectAsync
};