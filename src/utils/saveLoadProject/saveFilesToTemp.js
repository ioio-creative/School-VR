import fileSystem from 'utils/fileSystem';
import {getTempProjectVideoFilePath} from 'utils/saveLoadProject/getProjectPaths';


function saveVideoToProjectTemp(srcFilePath, projectName, assetId, callBack) {
  const destFilePath = getTempProjectVideoFilePath(projectName, assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  fileSystem.copyFile(srcFilePath, destFilePath, callBack);
}


export {
  saveVideoToProjectTemp
};
