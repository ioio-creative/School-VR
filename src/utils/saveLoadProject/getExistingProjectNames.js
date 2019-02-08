import fileSystem from 'utils/fileSystem/fileSystem';
import listProjects from './listProjects';

const getExistingProjectNames = (callBack) => {
  listProjects((err, projectFiles) => {    
    if (err) {
      fileSystem.handleGeneralErr(callBack, err);
    } else {
      const projectNames = projectFiles.map((projectFileNameWithExtension) => {
        return fileSystem.getFileNameWithoutExtension(projectFileNameWithExtension);
      });
      fileSystem.handleGeneralErrAndData(callBack, err, projectNames);
    }
  });
}

export default getExistingProjectNames;