import fileSystem from 'utils/fileSystem';
import {getTempProjectVideoFilePath} from 'utils/saveLoadProject/getProjectPaths';


function saveVideoToProjectTemp(srcFilePath, projectName, assetName, callBack) {
  const destFilePath = getTempProjectVideoFilePath(projectName, assetName, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
  //fileSystem.writeFile()
}


export {
  saveVideoToProjectTemp
};
