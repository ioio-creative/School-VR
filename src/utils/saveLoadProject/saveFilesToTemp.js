import fileSystem from 'utils/fileSystem/fileSystem';
import {
  getTempProjectImageFilePath,
  getTempProjectGifFilePath,
  getTempProjectVideoFilePath
} from 'utils/saveLoadProject/getProjectPaths';


async function copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists) {
  if (isAssumeDestDirExists) {
    await fileSystem.copyFileAssumingDestDirExistsPromise(srcFilePath, destFilePath);
  } else {
    await fileSystem.copyFileAsync(srcFilePath, destFilePath);
  }
}


async function saveImageToProjectTempAsync(srcFilePath, projectName, assetId, isAssumeDestDirExists) {
  const destFilePath = getTempProjectImageFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  await copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
  return destFilePath;
}

async function saveGifToProjectTempAsync(srcFilePath, projectName, assetId, isAssumeDestDirExists) {
  const destFilePath = getTempProjectGifFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  await copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
  return destFilePath;
}

async function saveVideoToProjectTempAsync(srcFilePath, projectName, assetId, isAssumeDestDirExists) {
  const destFilePath = getTempProjectVideoFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  await copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
  return destFilePath;
}


export {
  saveImageToProjectTempAsync,
  saveGifToProjectTempAsync,
  saveVideoToProjectTempAsync
};
