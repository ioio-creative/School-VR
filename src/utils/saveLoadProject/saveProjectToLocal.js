import config, {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem';

import parseDataToSaveFormat from './parseDataToSaveFormat';
import isProjectNameUsed from './isProjectNameUsed';
import {setCurrentLoadedProjectName} from './loadProject';


const saveProjectToLocal = (projectName, entitiesList, assetsList, callBack) => {
  const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);
  const jsonForSaveStr = JSON.stringify(jsonForSave);  

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
    const tempProjectDirPath = fileSystem.join(appDirectory.appTempProjectsDirectory, projectName);    
    fileSystem.deleteDirectorySafe(tempProjectDirPath, (err) => {
      if (err) {        
        fileSystem.handleGeneralErr(callBack, err);
        return;        
      }
      
      const tempJsonPath = fileSystem.join(tempProjectDirPath, projectName + config.jsonFileExtensionWithLeadingDot);      
      fileSystem.writeFile(tempJsonPath, jsonForSaveStr, (err) => {
        if (err) {          
          fileSystem.handleGeneralErr(callBack, err)
        } else {          
          console.log(`JSON file saved in ${tempJsonPath}`);

          // zip and move temp folder to appProjectsDirectory
          const destProjectPackagePath = fileSystem.join(appDirectory.appProjectsDirectory, projectName) + config.schoolVrProjectArchiveExtensionWithLeadingDot;
          fileSystem.createPackage(tempProjectDirPath, destProjectPackagePath, (err) => {
            if (err) {
              fileSystem.handleGeneralErr(callBack, err)
            } else {
              console.log(`Project file saved in ${destProjectPackagePath}`);

              // delete temp folder after move
              fileSystem.deleteDirectorySafe(tempProjectDirPath, (err) => {
                if (err) {
                  console.log(`Error when attempting to delete ${tempProjectDirPath}: ${err}`);
                  fileSystem.handleGeneralErrAndData(callBack, err, null);
                } else {
                  console.log(`${tempProjectDirPath} deleted`);
                  fileSystem.handleGeneralErrAndData(callBack, null, {
                    //tempProjectDirPath: tempProjectDirPath,
                    //tempJsonPath: tempJsonPath,
                    destProjectPackagePath: destProjectPackagePath
                  });
                }
              });
        
        
              setCurrentLoadedProjectName(projectName);
            }
          });          
        }
      });
    });       
  });
  
  return jsonForSaveStr;
};

export default saveProjectToLocal;
