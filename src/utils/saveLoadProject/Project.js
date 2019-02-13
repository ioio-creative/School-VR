import CustomedFileStats from 'utils/fileSystem/CustomedFileStats';
import {
  /* temp project */
  // directories
  getTempProjectDirectoryPath,
  getTempProjectImageDirectoryPath,
  getTempProjectGifDirectoryPath,
  getTempProjectVideoDirectoryPath,
  // files
  getTempProjectJsonFilePath,
  getTempProjectImageFilePath,
  getTempProjectGifFilePath,
  getTempProjectVideoFilePath,
  /* end of temp project */

  /* saved project */
  getSavedProjectFilePath,
  getImageFilePathRelativeToProjectDirectory,
  getGifFilePathRelativeToProjectDirectory,
  getVideoFilePathRelativeToProjectDirectory,
  /* end of saved project */
} from './getProjectPaths';


class Project {
  /**
   * 
   * @param {CustomedFileStats} fileStats 
   */
  constructor(fileStats) {
    this.fileStats = fileStats;
  }

  get name() {
    return this.fileStats.fileNameWithoutExtension;
  }


  /* getProjectPath */

  // temp project

  // directories
  get tempProjectDirectoryPath() {
    return getTempProjectDirectoryPath(this.name);
  }

  get tempProjectImageDirectoryPath() {
    return getTempProjectImageDirectoryPath(this.name);
  }

  get tempProjectGifDirectoryPath() {
    return getTempProjectGifDirectoryPath(this.name);
  }
  
  get tempProjectVideoDirectoryPath() {
    return getTempProjectVideoDirectoryPath(this.name);
  }

  // files
  get tempProjectJsonFilePath() {
    return getTempProjectJsonFilePath(this.name);
  }
  
  get tempProjectImageFilePath() {
    return getTempProjectImageFilePath(this.name);
  }

  get tempProjectGifFilePath() {
    return getTempProjectGifFilePath(this.name);
  }
  
  get tempProjectVideoFilePath() {
    return getTempProjectVideoFilePath(this.name);
  }

  // saved project
  
  get savedProjectFilePath() {
    return getSavedProjectFilePath(this.name);
  }

  get imageFilePathRelativeToProjectDirectory() {
    return getImageFilePathRelativeToProjectDirectory(this.name);
  }

  get gifFilePathRelativeToProjectDirectory() {
    return getGifFilePathRelativeToProjectDirectory(this.name);
  }

  get videoFilePathRelativeToProjectDirectory() {
    return getVideoFilePathRelativeToProjectDirectory(this.name);
  }

  /* end of getProjectPath */
}


export default Project;
