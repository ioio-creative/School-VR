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

const loadProject = (projectName, callBack) => {
  setCurrentLoadedProjectName(projectName);
}

export {
  //getCurrentLoadedProjectName,
  setCurrentLoadedProjectName,
  isCurrentLoadedProject,
  loadProject
};
