import ProjectFile from './ProjectFile';


const saveProjectToLocalAsync = async (projectName, entitiesList, assetsList) => {
  const project = new ProjectFile(projectName);
  return await project.saveToLocalAsync(entitiesList, assetsList);
};


export {
  saveProjectToLocalAsync
};