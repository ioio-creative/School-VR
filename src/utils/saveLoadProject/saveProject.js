import Project from './Project';


const saveProjectToLocalAsync = async (projectName, entitiesList, assetsList) => {
  const project = new Project(projectName);
  return await project.saveToLocalAsync(entitiesList, assetsList);
};


export {
  saveProjectToLocalAsync
};