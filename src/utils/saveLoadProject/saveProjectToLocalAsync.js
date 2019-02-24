import {forEach} from 'p-iteration';

import {mediaType} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';

import parseDataToSaveFormat from './parseDataToSaveFormat';
import isProjectNameUsedAsync from './isProjectNameUsedAsync';
import {isCurrentLoadedProject, setCurrentLoadedProjectName} from './loadProject';
import {
  getTempProjectDirectoryPath,
  getTempProjectAllAssetsDirectoryPaths,
  getTempProjectJsonFilePath,
  getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative,
  getSavedProjectFilePath,
  getImageFilePathRelativeToProjectDirectory,
  getGifFilePathRelativeToProjectDirectory,
  getVideoFilePathRelativeToProjectDirectory  
} from './getProjectPaths';
import {
  saveImageToProjectTempAsync,
  saveGifToProjectTempAsync,
  saveVideoToProjectTempAsync
} from './saveFilesToTemp';


const convertProjectAssetSrcToProperAbsolutePath = (projectName, assetSrc) => {
  // strip file:/// from asset.src
  const strToStrip = "file:///";  
  if (assetSrc.includes(strToStrip)) {
    assetSrc = assetSrc.substr("file:///".length);
  }
  
  // TODO: this check of relative path is not well thought through!!!
  const absoluteAssetFilePath = 
    getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(projectName, assetSrc);      
  
  // TODO: check if using decodeURIComponent() here is appropriate
  // https://stackoverflow.com/questions/747641/what-is-the-difference-between-decodeuricomponent-and-decodeuri
  return decodeURIComponent(absoluteAssetFilePath);  
};

const getAllExistingProjectAssetFileAbsolutePathsInTempAsync = async (projectName) => {
  const projectAssetTempDirectories = getTempProjectAllAssetsDirectoryPaths(projectName);  
  const existingAssetFileAbsolutePathsInTemp = [];
  await forEach(projectAssetTempDirectories, async (assetTempDir) => {    
    const isAssetTempDirExists = await fileSystem.existsPromise(assetTempDir);        
    if (!isAssetTempDirExists) {
      return;
    }    
    const assetFileStatObjs = await fileSystem.readdirWithStatPromise(assetTempDir);    
    for (let assetFileStatObj of assetFileStatObjs) {      
      existingAssetFileAbsolutePathsInTemp.push(assetFileStatObj.path);      
    }
  });
  return existingAssetFileAbsolutePathsInTemp;
}

const createProjectAssetTempDirectoriesAsync = async (projectName) => {
  const projectAssetTempDirectories = getTempProjectAllAssetsDirectoryPaths(projectName);  
  await forEach(projectAssetTempDirectories, async (dir) => {        
    await fileSystem.createDirectoryIfNotExistsPromise(dir);
  });
};

const deleteProjectAssetTempDirectoriesAsync = async (projectName) => {
  const projectAssetTempDirectories = getTempProjectAllAssetsDirectoryPaths(projectName);
  await forEach(projectAssetTempDirectories, async (dir) => {
    await fileSystem.myDeletePromise(dir);
  });
};

// check assetsList and project asset temp directories,
// delete any assets not in assetsList
const deleteNonUsedProjectAssetsFromTempAsync = async (projectName, assetsList) => {
  if (!Array.isArray(assetsList) || assetsList.length === 0) {
    await deleteProjectAssetTempDirectoriesAsync(projectName);
    return;
  }  

  // check assetsList
  const normedAssetSrcAbsolutePaths = assetsList.map((asset) => {
    return fileSystem.normalize(convertProjectAssetSrcToProperAbsolutePath(projectName, asset.src));
  });
  const normedAssetSrcAbsolutePathsSet = 
    new Set(normedAssetSrcAbsolutePaths);

  // check project asset temp directories
  const existingProjectAssetFileAbsolutePaths = 
    await getAllExistingProjectAssetFileAbsolutePathsInTempAsync(projectName);  
  const normedExistingProjectAssetFileAbsolutePaths = 
    existingProjectAssetFileAbsolutePaths.map((path) => {
      return fileSystem.normalize(path);
    });
  const normedExistingProjectAssetFileAbsolutePathsSet = 
    new Set(normedExistingProjectAssetFileAbsolutePaths);

  // compare assetsList and project asset temp directories
  // set difference
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  const existingProjectAssetFilesNotInAssetsListSet = 
    new Set([...normedExistingProjectAssetFileAbsolutePathsSet].filter(
      x => !normedAssetSrcAbsolutePathsSet.has(x)
    ));

  // for debug only
  // console.log(assetsList);
  // console.log(normedExistingProjectAssetFileAbsolutePathsSet);
  // console.log(normedAssetSrcAbsolutePathsSet);
  // console.log(existingProjectAssetFilesNotInAssetsListSet);

  // delete these no longer used files
  await forEach([...existingProjectAssetFilesNotInAssetsListSet], async (filePath) => {
    await fileSystem.myDeletePromise(filePath);
  });
};

// saveProjectAssetsToTempAsync() will do nothing and pass control to callBack
// if assetsList.length === 0
const saveProjectAssetsToTempAsync = async (projectName, assetsList) => {
  if (!Array.isArray(assetsList) || assetsList.length === 0) {    
    return;
  }
  
  await createProjectAssetTempDirectoriesAsync(projectName);  

  const isAssumeProjectAssetTempDirectoriesExists = true;

  await forEach(assetsList, async (asset) => {
    const assetSrcAbsolutePath = convertProjectAssetSrcToProperAbsolutePath(projectName, asset.src);

    let saveFileToProjectTempAsyncFunc = null;    
    switch (asset.media_type) {
      case mediaType.image:
        saveFileToProjectTempAsyncFunc = saveImageToProjectTempAsync;
        break;
      case mediaType.gif:
        saveFileToProjectTempAsyncFunc = saveGifToProjectTempAsync;
        break;
      case mediaType.video:
      default:
        saveFileToProjectTempAsyncFunc = saveVideoToProjectTempAsync;
        break;
    }

    await saveFileToProjectTempAsyncFunc(assetSrcAbsolutePath, projectName, asset.id, 
      isAssumeProjectAssetTempDirectoriesExists);      
  });  
};

const saveProjectToLocalDetailAsync = async (tempProjectDirPath, projectName, entitiesList, assetsList) => {
  const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);
  
  // deal with assetsList
  await deleteNonUsedProjectAssetsFromTempAsync(projectName, assetsList);
  console.log("saveProjectToLocal - deleteNonUsedProjectAssetsFromTempAsync: Done");

  await saveProjectAssetsToTempAsync(projectName, assetsList);
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
  await fileSystem.writeFilePromise(tempJsonPath, jsonForSaveStr);      
  console.log(`saveProjectToLocal - saveProjectToLocalDetail: JSON file saved in ${tempJsonPath}`);

  // zip and move temp folder to appProjectsDirectory
  const destProjectPackagePath = getSavedProjectFilePath(projectName);
  await fileSystem.createPackagePromise(tempProjectDirPath, destProjectPackagePath);
  console.log(`saveProjectToLocal - saveProjectToLocalDetail: Project file saved in ${destProjectPackagePath}`);
      
  setCurrentLoadedProjectName(projectName);
  
  return {
    //tempProjectDirPath: tempProjectDirPath,
    //tempJsonPath: tempJsonPath,
    jsonForSave: jsonForSave,
    destProjectPackagePath: destProjectPackagePath
  };
};

const saveProjectToLocalAsync = async (projectName, entitiesList, assetsList) => {
  let savedProjectObj;

  // save in temp folder before zip (in appTempProjectsDirectory)
    
  // check if projectName is already used  
  const isNameUsed = await isProjectNameUsedAsync(projectName);

  if (isNameUsed) {      
    const projectNameTakenError = new Error(`Project name "${projectName}" is used`);
    throw projectNameTakenError;
  }

  // check if tempProjectDir already exists, if exists, delete it
  // actually this step may be redundant because I would check isProjectNameUsedAsync
  const tempProjectDirPath = getTempProjectDirectoryPath(projectName);
  if (!isCurrentLoadedProject(projectName)) {      
    await fileSystem.myDeletePromise(tempProjectDirPath);
    savedProjectObj = await saveProjectToLocalDetailAsync(tempProjectDirPath, projectName, entitiesList, assetsList);    
  } else {      
    savedProjectObj = await saveProjectToLocalDetailAsync(tempProjectDirPath, projectName, entitiesList, assetsList);
  }

  return savedProjectObj;
};

export default saveProjectToLocalAsync;
