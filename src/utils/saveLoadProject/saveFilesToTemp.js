import fileSystem from 'utils/fileSystem/fileSystem';
import {
  getTempProjectImageFilePath,
  getTempProjectGifFilePath,
  getTempProjectVideoFilePath
} from 'utils/saveLoadProject/getProjectPaths';


function copyFile(srcFilePath, destFilePath, isAssumeDestDirExists, callBack) {
  if (isAssumeDestDirExists) {
    fileSystem.copyFileAssumingDestDirExists(srcFilePath, destFilePath, callBack);
  } else {
    fileSystem.copyFile(srcFilePath, destFilePath, callBack);
  }
}


function saveImageToProjectTemp(srcFilePath, projectName, assetId, isAssumeDestDirExists, callBack) {
  const destFilePath = getTempProjectImageFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  copyFile(srcFilePath, destFilePath, isAssumeDestDirExists, callBack);
  return destFilePath;
}

function saveGifToProjectTemp(srcFilePath, projectName, assetId, isAssumeDestDirExists, callBack) {
  const destFilePath = getTempProjectGifFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  copyFile(srcFilePath, destFilePath, isAssumeDestDirExists, callBack);
  return destFilePath;
}

function saveVideoToProjectTemp(srcFilePath, projectName, assetId, isAssumeDestDirExists, callBack) {
  const destFilePath = getTempProjectVideoFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  copyFile(srcFilePath, destFilePath, isAssumeDestDirExists, callBack);
  return destFilePath;
}


export {
  saveImageToProjectTemp,
  saveGifToProjectTemp,
  saveVideoToProjectTemp
};
