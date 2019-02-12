import fileSystem from 'utils/fileSystem/fileSystem';
import listProjectsAsync from './listProjectsAsync';

const getExistingProjectNamesAsync = async () => {
  const projectFileStats = await listProjectsAsync();  
  const projectNames = projectFileStats.map((projectFileStat) => {
    return fileSystem.getFileNameWithoutExtension(projectFileStat.path);
  });
  return projectNames;  
};

export default getExistingProjectNamesAsync;