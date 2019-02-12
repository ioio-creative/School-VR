import {filter} from 'p-iteration';

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
  const fileCustomedStatsObjs = await fileSystem.readdirWithStatPromise(appProjectsDirectory);

  if (!fileCustomedStatsObjs || fileCustomedStatsObjs.length === 0) {
    return [];
  }

  const filteredFileStatObjs = await filter(fileCustomedStatsObjs, async (fileCustomedStatsObj) => {
    // remove directory
    if (fileCustomedStatsObj.isDirectory()) {
      return false;
    }

    // remove file with other extension
    if (fileCustomedStatsObj.fileExtensionWithLeadingDot !== config.schoolVrProjectArchiveExtensionWithLeadingDot) {
      return false;
    }

    return true;
  });

  const sortedFileStatObjs = 
    filteredFileStatObjs.sort(compareFileStatsByAccessTimeDesc);
  
  return sortedFileStatObjs;
};

export default listProjectsAsync;