import fileSystem from 'utils/fileSystem/fileSystem';
import listProjectsAsync from './listProjectsAsync';

const getExistingProjectNamesAsync = async () => {
  const projectFileStats = await listProjectsAsync();  
  const projectNames = projectFileStats.map((projectFileStat) => {
    return fileSystem.getFileNameWithoutExtension(projectFileStat.path);
  });
  return projectNames;  
};

// const getExistingProjectNames = (callBack) => {
//   listProjects((err, projectFiles) => {    
//     if (err) {
//       fileSystem.handleGeneralErr(callBack, err);
//     } else {
//       const projectNames = projectFiles.map((projectFileNameWithExtension) => {
//         return fileSystem.getFileNameWithoutExtension(projectFileNameWithExtension);
//       });
//       fileSystem.handleGeneralErrAndData(callBack, err, projectNames);
//     }
//   });
// };

export default getExistingProjectNamesAsync;