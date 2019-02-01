import fileSystem from 'utils/fileSystem';
import {
  getTempProjectImageFilePath,
  getTempProjectGifFilePath,
  getTempProjectVideoFilePath
} from 'utils/saveLoadProject/getProjectPaths';


function saveImageToProjectTemp(srcFilePath, projectName, assetId, callBack) {
  const destFilePath = getTempProjectImageFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  fileSystem.copyFile(srcFilePath, destFilePath, callBack);
  return destFilePath;
}

function saveGifToProjectTemp(srcFilePath, projectName, assetId, callBack) {
  const destFilePath = getTempProjectGifFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));  
  fileSystem.copyFile(srcFilePath, destFilePath, callBack);
  return destFilePath;
}

function saveVideoToProjectTemp(srcFilePath, projectName, assetId, callBack) {
  const destFilePath = getTempProjectVideoFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  fileSystem.copyFile(srcFilePath, destFilePath, callBack);
  return destFilePath;
}


export {
  saveImageToProjectTemp,
  saveGifToProjectTemp,
  saveVideoToProjectTemp
};
