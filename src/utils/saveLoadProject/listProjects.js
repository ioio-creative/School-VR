import config, {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';

const compareFileStatsByAccessTimeAsc = (fileStat1, fileStat2) => {
  if (fileStat1.atimeMs < fileStat2.atimeMs) {
    return -1;
  } else if (fileStat1.atimeMs > fileStat2.atimeMs) {
    return 1;
  } else {
    return 0;
  }
};

const compareFileStatsByAccessTimeDesc = (fileStat1, fileStat2) => {
  return -1 * compareFileStatsByAccessTimeAsc(fileStat1, fileStat2);
};

const compareFileFullPathsByAccessTimeAsc = (filePath1, filePath2) => {
  return compareFileStatsByAccessTimeAsc(fileSystem.statSync(filePath1), fileSystem.statSync(filePath2));
};

const compareFileFullPathsByAccessTimeDesc = (filePath1, filePath2) => {
  return -1 * compareFileFullPathsByAccessTimeAsc(filePath1, filePath2);
};

const listProjects = (callBack) => {
  const appProjectsDirectory = appDirectory.appProjectsDirectory;
  // Note: files are just file names, not full paths
  fileSystem.readdir(appProjectsDirectory, (err, files) => {    
    // if (files && files.length > 0) {
    //   console.log(`Files in ${appProjectsDirectory}:`);
    //   files.forEach((file) => {
    //     console.log(file);
    //   });
    // }

    const fullPaths = files.map(file => fileSystem.join(appProjectsDirectory, file));  

    const filteredFullPaths = fullPaths.filter((fullPath) => {
      // remove directory
      if (fileSystem.isDirectorySync(fullPath)) {
        return false;
      }

      // remove file with other extension
      if (fileSystem.getFileExtensionWithLeadingDot(fullPath) !== config.schoolVrProjectArchiveExtensionWithLeadingDot) {
        return false;
      }

      return true;
    });

    const sortedFilteredFullPaths = 
      filteredFullPaths.sort(compareFileFullPathsByAccessTimeDesc);

    fileSystem.handleGeneralErrAndData(callBack, err, sortedFilteredFullPaths);
  });
};

export default listProjects;
