import {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem';

const listProjects = (callBack) => {
  const appProjectsDirectory = appDirectory.appProjectsDirectory;
  fileSystem.readdir(appProjectsDirectory, (err, files) => {    
    if (files && files.length > 0) {
      console.log(`Files in ${appProjectsDirectory}:`);
      files.forEach((file) => {
        console.log(file);
      });
    }
    fileSystem.handleGeneralErrAndData(callBack, err, files);
  })
};

export default listProjects;
