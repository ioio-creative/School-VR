import {map, filter} from 'p-iteration';

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

/**
 * Return array of fs.Stats objects
 */
const listProjectsAsync = async () => {
  const appProjectsDirectory = appDirectory.appProjectsDirectory;
  // Note: fileNames are just file names, not full paths
  const fileNames = await fileSystem.readdirPromise(appProjectsDirectory);

  if (!fileNames || fileNames.length === 0) {
    return [];
  }

  const fullPaths = fileNames.map(fileName => fileSystem.join(appProjectsDirectory, fileName)); 

  const filteredFullPaths = await filter(fullPaths, async (fullPath) => {
    const isDirectory = await fileSystem.isDirectoryPromise(fullPath);

    // remove directory
    if (isDirectory) {
      return false;
    }

    // remove file with other extension
    if (fileSystem.getFileExtensionWithLeadingDot(fullPath) !== config.schoolVrProjectArchiveExtensionWithLeadingDot) {
      return false;
    }

    return true;
  });

  const fileStatObjs = await map(filteredFullPaths, async (fileFullPath) => {
    return await fileSystem.statPromise(fileFullPath);
  });  
  
  const sortedFileStatObjs = 
    fileStatObjs.sort(compareFileStatsByAccessTimeDesc);
  
  return sortedFileStatObjs;
};

// const listProjects = (callBack) => {
//   const appProjectsDirectory = appDirectory.appProjectsDirectory;
//   // Note: files are just file names, not full paths
//   fileSystem.readdir(appProjectsDirectory, (err, files) => {    
//     // if (files && files.length > 0) {
//     //   console.log(`Files in ${appProjectsDirectory}:`);
//     //   files.forEach((file) => {
//     //     console.log(file);
//     //   });
//     // }

//     const fullPaths = files.map(file => fileSystem.join(appProjectsDirectory, file));  

//     const filteredFullPaths = fullPaths.filter((fullPath) => {
//       // remove directory
//       if (fileSystem.isDirectorySync(fullPath)) {
//         return false;
//       }

//       // remove file with other extension
//       if (fileSystem.getFileExtensionWithLeadingDot(fullPath) !== config.schoolVrProjectArchiveExtensionWithLeadingDot) {
//         return false;
//       }

//       return true;
//     });

//     const sortedFilteredFullPaths = 
//       filteredFullPaths.sort(compareFileFullPathsByAccessTimeDesc);

//     fileSystem.handleGeneralErrAndData(callBack, err, sortedFilteredFullPaths);
//   });
// };

export default listProjectsAsync;