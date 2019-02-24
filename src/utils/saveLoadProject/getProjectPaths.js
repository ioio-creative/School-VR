import config from 'globals/config';
import {appDirectory, projectDirectoryStructure} from 'globals/config';

import fileSystem from 'utils/fileSystem/fileSystem';


/* temp project */

/* directories */
function getTempProjectDirectoryPath(projectName) {
  return fileSystem.join(appDirectory.appTempProjectsDirectory, projectName);
}

function getTempProjectImageDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectDirectoryStructure.image);
}

function getTempProjectGifDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectDirectoryStructure.gif);
}

function getTempProjectVideoDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectDirectoryStructure.video);
}

function getTempProjectAllAssetsDirectoryPaths(projectName) {
  return [
    getTempProjectImageDirectoryPath(projectName),
    getTempProjectGifDirectoryPath(projectName),
    getTempProjectVideoDirectoryPath(projectName)
  ];
}

/* files */
function getTempProjectJsonFilePath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectName + config.jsonFileExtensionWithLeadingDot);
}

function getTempProjectImageFilePath(projectName, assetId, fileExtensionWithDot) {
  return fileSystem.join(getTempProjectImageDirectoryPath(projectName), assetId) + fileExtensionWithDot;
}

function getTempProjectGifFilePath(projectName, assetId, fileExtensionWithDot) {
  return fileSystem.join(getTempProjectGifDirectoryPath(projectName), assetId) + fileExtensionWithDot;
}

function getTempProjectVideoFilePath(projectName, assetId, fileExtensionWithDot) {
  return fileSystem.join(getTempProjectVideoDirectoryPath(projectName), assetId) + fileExtensionWithDot;
}

function getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(projectName, assetPath) {
  return isAssetPathRelative(assetPath) ?
    fileSystem.join(getTempProjectDirectoryPath(projectName), assetPath) : assetPath;
}

/* end of temp project */


/* saved project */

function getSavedProjectFilePath(projectName) {
  return fileSystem.join(appDirectory.appProjectsDirectory, projectName) + config.schoolVrProjectArchiveExtensionWithLeadingDot;
}

function getImageFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {
  return fileSystem.join(projectDirectoryStructure.image, assetId) + fileExtensionWithDot; 
}

function getGifFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {
  return fileSystem.join(projectDirectoryStructure.gif, assetId) + fileExtensionWithDot; 
}

function getVideoFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {
  return fileSystem.join(projectDirectoryStructure.video, assetId) + fileExtensionWithDot; 
}

function isAssetPathRelative(assetPath) {
  let isAssetPathRelative = false;
  for (let assetDirectory in projectDirectoryStructure) {    
    if (assetPath.indexOf(projectDirectoryStructure[assetDirectory]) === 0) {
      isAssetPathRelative = true;
      break;
    }
  }
  return isAssetPathRelative;
}

/* end of saved project */


export {
  /* temp project */
  // directories
  getTempProjectDirectoryPath,
  getTempProjectImageDirectoryPath,
  getTempProjectGifDirectoryPath,
  getTempProjectVideoDirectoryPath,
  getTempProjectAllAssetsDirectoryPaths,
  // files
  getTempProjectJsonFilePath,
  getTempProjectImageFilePath,
  getTempProjectGifFilePath,
  getTempProjectVideoFilePath,
  getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative,
  /* end of temp project */

  /* saved project */
  getSavedProjectFilePath,
  getImageFilePathRelativeToProjectDirectory,
  getGifFilePathRelativeToProjectDirectory,
  getVideoFilePathRelativeToProjectDirectory,
  isAssetPathRelative
  /* end of saved project */
};
