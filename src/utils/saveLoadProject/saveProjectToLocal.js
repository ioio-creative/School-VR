import {mediaType} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';

import parseDataToSaveFormat from './parseDataToSaveFormat';
import isProjectNameUsed from './isProjectNameUsed';
import {isCurrentLoadedProject, setCurrentLoadedProjectName} from './loadProject';
import {
  getTempProjectDirectoryPath,
  getTempProjectImageDirectoryPath,
  getTempProjectGifDirectoryPath,
  getTempProjectVideoDirectoryPath,
  getTempProjectJsonFilePath,
  getSavedProjectFilePath,
  getImageFilePathRelativeToProjectDirectory,
  getGifFilePathRelativeToProjectDirectory,
  getVideoFilePathRelativeToProjectDirectory,
  isAssetPathRelative
} from './getProjectPaths';
import {
  saveImageToProjectTemp,
  saveGifToProjectTemp,
  saveVideoToProjectTemp
} from './saveFilesToTemp';


const EOL = require('os').EOL;


/* utils */

const getCallBackReturnedDataObjects = (totNumOfObjs) => {
  const callBackReturnedDataObjects = [];
  for (let i = 0; i < totNumOfObjs; i++) {
    callBackReturnedDataObjects.push({
      isCallBackReturned: false,
      error: null
    });
  }
  return callBackReturnedDataObjects;
}

const getDealWithAnyCallBackErrorsFunc = (callBackDataObjs, callBack) => {
  return function() {
    const isError = callBackDataObjs.reduce((prevVal, currErrObj) => {
      return prevVal || (currErrObj.error !== null);
    }, false);
    if (isError) {
      const errMsg = callBackDataObjs
        .filter(errObj => errObj !== null)
        .map(errObj => errObj.error)
        .join(EOL);
      callBack(new Error(errMsg));
    } else {
      callBack(null);
    }
  }
}

/* end of utils */


const createProjectAssetTempDirectories = (projectName, callBack) => {
  const projectAssetTempDirectories = [
    getTempProjectImageDirectoryPath(projectName),
    getTempProjectGifDirectoryPath(projectName),
    getTempProjectVideoDirectoryPath(projectName)
  ];

  const totNumOfTempDirs = projectAssetTempDirectories.length;
  let numOfCreateDirCallBackReturned = 0;

  const createDirReturnedErrors = 
    getCallBackReturnedDataObjects(totNumOfTempDirs);  

  // deal with the errors, if any, from creating each directory
  const dealWithAnyErrorsFunc = 
    getDealWithAnyCallBackErrorsFunc(createDirReturnedErrors, callBack);

  const keepCheckCallBackFunc = (err, idx) => {
    numOfCreateDirCallBackReturned++;

    createDirReturnedErrors[idx] = {
      isCallBackReturned: true,
      error: err
    };

    const areAllCreateDirCallBacksReturned = numOfCreateDirCallBackReturned === totNumOfTempDirs;
    
    if (areAllCreateDirCallBacksReturned) {      
      dealWithAnyErrorsFunc();
    }
  };

  projectAssetTempDirectories.forEach((dir, idx) => {
    fileSystem.createDirectoryIfNotExists(dir, (err) => keepCheckCallBackFunc(err, idx));
  });
}

// saveProjectAssetsToTemp() will do nothing and pass control to callBack
// if assetsList.length === 0
const saveProjectAssetsToTemp = (projectName, assetsList, callBack) => {
  if (!assetsList || assetsList.length === 0) {
    callBack(null);
    return;
  }
  
  createProjectAssetTempDirectories(projectName, (err) => {
    if (err) {
      fileSystem.handleGeneralErr(err);
      return;
    }

    const totNumOfAssets = assetsList.length;
    let numOfSaveAssetToTempCallBackReturned = 0;

    // use keepCheckCallBack to set saveAssetReturnedErrors array
    // when doing the assetsList.forEach() loop below
    const saveAssetReturnedErrors = getCallBackReturnedDataObjects(totNumOfAssets);

    // deal with the errors, if any, from saving each of the assets
    const dealWithAnyErrorsFunc = getDealWithAnyCallBackErrorsFunc(saveAssetReturnedErrors, callBack);

    const keepCheckCallBackFunc = (err, assetIdx) => {
      numOfSaveAssetToTempCallBackReturned++;

      saveAssetReturnedErrors[assetIdx] = {
        isCallBackReturned: true,
        error: err
      };
      
      // const areAllSaveAssetCallBacksReturned = saveAssetReturnedErrors.reduce((prevVal, currErrObj) => {
      //   return prevVal && currErrObj.isCallBackReturned;
      // }, true);
      const areAllSaveAssetCallBacksReturned = numOfSaveAssetToTempCallBackReturned === totNumOfAssets;

      // console.log(areAllSaveAssetCallBacksReturned);
      if (areAllSaveAssetCallBacksReturned) {      
        dealWithAnyErrorsFunc();
      }
    };

    const isAssumeProjectAssetTempDirectoriesExists = true;

    assetsList.forEach((asset, idx) => {
      // strip file:/// from asset.src
      const strToStrip = "file:///";
      let assetFileSrc = asset.src;
      if (assetFileSrc.indexOf(strToStrip) > -1) {
        assetFileSrc = assetFileSrc.substr("file:///".length);
      }
      
      // TODO: check if using decodeURIComponent() here is appropriate
      // https://stackoverflow.com/questions/747641/what-is-the-difference-between-decodeuricomponent-and-decodeuri
      
      // TODO: this check of relative path is not well thought through!!!
      const fullAssetFilePath = isAssetPathRelative(assetFileSrc) ?
        fileSystem.join(getTempProjectDirectoryPath(projectName), assetFileSrc) : assetFileSrc;
      
      const decodedFullAssetFilePath = decodeURIComponent(fullAssetFilePath);

      let saveFileToProjectTempFunc = null;    
      switch (asset.media_type) {
        case mediaType.image:
          saveFileToProjectTempFunc = saveImageToProjectTemp;
          break;
        case mediaType.gif:
          saveFileToProjectTempFunc = saveGifToProjectTemp;  
          break;
        case mediaType.video:
        default:
          saveFileToProjectTempFunc = saveVideoToProjectTemp;
          break;
      }

      saveFileToProjectTempFunc(decodedFullAssetFilePath, projectName, asset.id, 
        isAssumeProjectAssetTempDirectoriesExists,
        (err) => keepCheckCallBackFunc(err, idx));  
    });
    
  });
};

const saveProjectToLocalDetail = (tempProjectDirPath, projectName, entitiesList, assetsList, callBack) => {
  const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);
  
  // deal with assetsList          
  saveProjectAssetsToTemp(projectName, assetsList, (err) => {
    if (err) {
      fileSystem.handleGeneralErr(callBack, err);
    } else {
      console.log(`saveProjectToLocal - saveProjectToLocalDetail: Assets saved in ${tempProjectDirPath}`);

      // TODO: The following modify the objects in the input assetsList directly. Is this alright?
      // modify assets_list node in jsonForSave to reflect the relative paths of the project folder structure to be zipped
      jsonForSave.assets_list.forEach((asset) => {
        let getAssetFilePathRelativeToProjectDirectoryFunc = null;
        switch (asset.media_type) {
          case mediaType.image:
            getAssetFilePathRelativeToProjectDirectoryFunc = getImageFilePathRelativeToProjectDirectory;
            break;
          case mediaType.gif:
            getAssetFilePathRelativeToProjectDirectoryFunc = getGifFilePathRelativeToProjectDirectory;  
            break;
          case mediaType.video:
          default:
            getAssetFilePathRelativeToProjectDirectoryFunc = getVideoFilePathRelativeToProjectDirectory;
            break;
        }
        
        const assetFilePathRelativeToProjectDirectory = 
          getAssetFilePathRelativeToProjectDirectoryFunc(asset.id, fileSystem.getFileExtensionWithLeadingDot(asset.src));
        asset.src = assetFilePathRelativeToProjectDirectory;
      });

      // write project json file
      const jsonForSaveStr = JSON.stringify(jsonForSave);
      const tempJsonPath = getTempProjectJsonFilePath(projectName);
      fileSystem.writeFile(tempJsonPath, jsonForSaveStr, (err) => {
        if (err) {          
          fileSystem.handleGeneralErr(callBack, err)
        } else {          
          console.log(`saveProjectToLocal - saveProjectToLocalDetail: JSON file saved in ${tempJsonPath}`);

          // zip and move temp folder to appProjectsDirectory
          const destProjectPackagePath = getSavedProjectFilePath(projectName);
          fileSystem.createPackage(tempProjectDirPath, destProjectPackagePath, (err) => {
            if (err) {
              fileSystem.handleGeneralErr(callBack, err);
            } else {
              console.log(`saveProjectToLocal - saveProjectToLocalDetail: Project file saved in ${destProjectPackagePath}`);
              setCurrentLoadedProjectName(projectName);          
              fileSystem.handleGeneralErrAndData(callBack, null, {
                //tempProjectDirPath: tempProjectDirPath,
                //tempJsonPath: tempJsonPath,
                jsonForSave: jsonForSave,
                destProjectPackagePath: destProjectPackagePath
              });
            }
          });
        }
      });
    }
  });
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
