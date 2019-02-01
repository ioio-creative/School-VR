import config from 'globals/config';
import {appDirectory, projectDirectoryStructure} from 'globals/config';

import fileSystem from 'utils/fileSystem';


/* temp project */

/* directories */
function getTempProjectDirectoryPath(projectName) {
  return fileSystem.join(appDirectory.appTempProjectsDirectory, projectName);
}

function getTempProjectImageDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectDirectoryStructure.imageDirectory);
}

function getTempProjectGifDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectDirectoryStructure.gifDirectory);
}

function getTempProjectVideoDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectDirectoryStructure.videoDirectory);
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

/* end of temp project */


/* saved project */

function getSavedProjectFilePath(projectName) {
  return fileSystem.join(appDirectory.appProjectsDirectory, projectName) + config.schoolVrProjectArchiveExtensionWithLeadingDot;
}

function getImageFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {
  return fileSystem.join(projectDirectoryStructure.imageDirectory, assetId) + fileExtensionWithDot; 
}

function getGifFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {
  return fileSystem.join(projectDirectoryStructure.gifDirectory, assetId) + fileExtensionWithDot; 
}

function getVideoFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {
  return fileSystem.join(projectDirectoryStructure.videoDirectory, assetId) + fileExtensionWithDot; 
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
  // getTempProjectImageDirectoryPath,
  // getTempProjectGifDirectoryPath,
  // getTempProjectVideoDirectoryPath,
  // files
  getTempProjectJsonFilePath,
  getTempProjectImageFilePath,
  getTempProjectGifFilePath,
  getTempProjectVideoFilePath,
  /* end of temp project */

  /* saved project */
  getSavedProjectFilePath,
  getImageFilePathRelativeToProjectDirectory,
  getGifFilePathRelativeToProjectDirectory,
  getVideoFilePathRelativeToProjectDirectory,
  isAssetPathRelative
  /* end of saved project */
};
