import config from 'globals/config';
import {appDirectory, tempProjectDirectoryStructure} from 'globals/config';

import fileSystem from 'utils/fileSystem';


/* temp project */

function getTempProjectDirectoryPath(projectName) {
  return fileSystem.join(appDirectory.appTempProjectsDirectory, projectName);
}

function getTempProjectVideoDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), tempProjectDirectoryStructure.videoDirectory);
}

function getTempProjectImageDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), tempProjectDirectoryStructure.imageDirectory);
}

function getTempProjectGifDirectoryPath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), tempProjectDirectoryStructure.gifDirectory);
}

function getTempProjectJsonFilePath(projectName) {
  return fileSystem.join(getTempProjectDirectoryPath(projectName), projectName + config.jsonFileExtensionWithLeadingDot);
}

function getTempProjectVideoFilePath(projectName, assetId, fileExtensionWithDot) {
  return fileSystem.join(getTempProjectVideoDirectoryPath(projectName), assetId) + fileExtensionWithDot;
}

/* end of temp project */


/* saved project */

function getSavedProjectFilePath(projectName) {
  return fileSystem.join(appDirectory.appProjectsDirectory, projectName) + config.schoolVrProjectArchiveExtensionWithLeadingDot;
}

/* end of saved project */


export {
  // temp project
  getTempProjectDirectoryPath,
  // getTempProjectVideoDirectoryPath,
  // getTempProjectImageDirectoryPath,
  // getTempProjectGifDirectoryPath,
  getTempProjectJsonFilePath,
  getTempProjectVideoFilePath,

  // saved project
  getSavedProjectFilePath
};
