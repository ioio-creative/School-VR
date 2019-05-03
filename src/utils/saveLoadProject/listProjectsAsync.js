import {filter} from 'p-iteration';

import config, {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';

import ProjectFile from 'utils/saveLoadProject/ProjectFile';


const funcFactoryForCompareFileStatsByProperty = (fileStatPropSelectFunc, isOrderByDesc) => {
  return (fileStat1, fileStat2) => {
    let valueToReturn = 0;

    const [fileStat1Prop, fileStat2Prop] = [fileStat1, fileStat2].map(fileStat => fileStatPropSelectFunc(fileStat));    
    if (fileStat1Prop < fileStat2Prop) {
      valueToReturn = -1;
    } else if (fileStat1Prop > fileStat2Prop) {
      valueToReturn = 1;
    } else {
      valueToReturn = 0;
    }

    return isOrderByDesc ? -1 * valueToReturn : valueToReturn;
  };
};


/**
 * Return array of Project objects
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

  //const compareFileStatsByAccessTimeAsc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.atimeMs, false);
  const compareFileStatsByAccessTimeDesc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.atimeMs, true);
  //const compareFileStatsByModifiedTimeDesc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.mtimeMs, true);

  const sortedFileStatObjs = 
    filteredFileStatObjs.sort(compareFileStatsByAccessTimeDesc);

  const sortedProjectFileObjs = sortedFileStatObjs.map(fileStatObj => new ProjectFile(null, null, fileStatObj));
  
  return sortedProjectFileObjs;
};


export default listProjectsAsync;

export {
  funcFactoryForCompareFileStatsByProperty
};