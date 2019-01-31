import fileSystem from 'utils/fileSystem';

import parseDataToSaveFormat from './parseDataToSaveFormat';
import isProjectNameUsed from './isProjectNameUsed';
import {isCurrentLoadedProject, setCurrentLoadedProjectName} from './loadProject';
import {getTempProjectDirectoryPath, getTempProjectJsonFilePath, getSavedProjectFilePath} from './getProjectPaths';


const saveProjectToLocalDetail = (tempProjectDirPath, projectName, entitiesList, assetsList, callBack) => {
  const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);
  const jsonForSaveStr = JSON.stringify(jsonForSave);  

  const tempJsonPath = getTempProjectJsonFilePath(projectName);
  fileSystem.writeFile(tempJsonPath, jsonForSaveStr, (err) => {
    if (err) {          
      fileSystem.handleGeneralErr(callBack, err)
    } else {          
      console.log(`JSON file saved in ${tempJsonPath}`);

      // zip and move temp folder to appProjectsDirectory
      const destProjectPackagePath = getSavedProjectFilePath(projectName);
      fileSystem.createPackage(tempProjectDirPath, destProjectPackagePath, (err) => {
        if (err) {
          fileSystem.handleGeneralErr(callBack, err)
        } else {
          console.log(`Project file saved in ${destProjectPackagePath}`);

          setCurrentLoadedProjectName(projectName);
          
          fileSystem.handleGeneralErrAndData(callBack, null, {
            //tempProjectDirPath: tempProjectDirPath,
            //tempJsonPath: tempJsonPath,
            destProjectPackagePath: destProjectPackagePath
          });                
        }
      });          
    }
  });

  return jsonForSave;
};


const saveProjectToLocal = (projectName, entitiesList, assetsList, callBack) => {
  let jsonForSave;  

  // save in temp folder before zip (in appTempProjectsDirectory)
    
  // check if projectName is already used  
  isProjectNameUsed(projectName, (err, isNameUsed) => {    
    if (err) {
      fileSystem.handleGeneralErr(callBack, err);
      return;
    }    

    if (isNameUsed) {      
      const projectNameTakenError = new Error(`Project name "${projectName}" is used`);
      fileSystem.handleGeneralErr(callBack, projectNameTakenError);
      return;
    }

    // check if tempProjectDir already exists, if exists, delete it
    // actually this step may be redundant because I would check isProjectNameUsed
    const tempProjectDirPath = getTempProjectDirectoryPath(projectName);
    if (!isCurrentLoadedProject(projectName)) {
      fileSystem.myDelete(tempProjectDirPath, (err) => {
        if (err) {        
          fileSystem.handleGeneralErr(callBack, err);
          return;        
        }
        
        jsonForSave = saveProjectToLocalDetail(tempProjectDirPath, projectName, entitiesList, assetsList, callBack);
      });
    } else {
      jsonForSave = saveProjectToLocalDetail(tempProjectDirPath, projectName, entitiesList, assetsList, callBack);
    }
  });
  
  return jsonForSave;
};

export default saveProjectToLocal;
