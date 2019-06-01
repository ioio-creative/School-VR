const {forEach} = require('p-iteration');
const {config, mediaType, appDirectory, projectDirectoryStructure} = require('../../globals/config');
const fileSystem = require('../fileSystem/fileSystem');
const CustomedFileStats = require('../fileSystem/CustomedFileStats');
const isNonEmptyArray = require('../variableType/isNonEmptyArray');
const listProjectsAsync = require('./listProjectsAsync');
const {isCurrentLoadedProject, setCurrentLoadedProjectFilePath} = require('./loadProject');
const parseDataToSaveFormat = require('./parseDataToSaveFormat');


class ProjectFile {
  /**
   * 
   * @param {String} projectName
   * @param {String} projectFilePath
   * @param {CustomedFileStats} customedProjectFileStats
   */
  // just need to enter either 1 of the 3 arguments, others can be null
  // if 1st argument is not null, 2nd and 3rd arguments will be ignored
  // so on and so forth
  constructor(projectName, projectFilePath, customedProjectFileStats) {    
    this.name = "";
    // saved project
    this.savedProjectFilePath = ""; 
    this.projectFileStats = null;
    this.projectJson = null;  // set in loadProjectByFilePathAsync
    
    if (projectName) {
      this.name = projectName;
      this.savedProjectFilePath = fileSystem.join(appDirectory.appProjectsDirectory, this.name) + config.schoolVrProjectArchiveExtensionWithLeadingDot;
    }

    if (projectFilePath) {
      if (!this.name) {
        this.name = fileSystem.getFileNameWithoutExtension(projectFilePath)
      }
      if (!this.savedProjectFilePath) {
        this.savedProjectFilePath = projectFilePath;
      }  
    }

    if (customedProjectFileStats) {      
      if (!this.name) {        
        this.name = customedProjectFileStats.fileNameWithoutExtension;
      }
      if (!this.savedProjectFilePath) {        
        this.savedProjectFilePath = customedProjectFileStats.path;
      }
      if (!this.projectFileStats) {
        this.projectFileStats = customedProjectFileStats;
      }
    }


    // set derived properties        
    // temp project directories    
    this.tempProjectDirectoryPath = fileSystem.join(appDirectory.appTempProjectsDirectory, this.name);
    this.tempProjectImageDirectoryPath = fileSystem.join(this.tempProjectDirectoryPath, projectDirectoryStructure.image);
    this.tempProjectGifDirectoryPath = fileSystem.join(this.tempProjectDirectoryPath, projectDirectoryStructure.gif);
    this.tempProjectVideoDirectoryPath = fileSystem.join(this.tempProjectDirectoryPath, projectDirectoryStructure.video);
    this.tempProjectAllAssetsDirectoryPaths = [
      this.tempProjectImageDirectoryPath,
      this.tempProjectGifDirectoryPath,
      this.tempProjectVideoDirectoryPath
    ];
    // temp project files
    this.tempProjectJsonFilePath = fileSystem.join(this.tempProjectDirectoryPath, this.name + config.jsonFileExtensionWithLeadingDot);

    // fileStats properties
    if (this.projectFileStats) {
      // https://nodejs.org/api/fs.html#fs_stats_ctime
      this.atime = this.projectFileStats.atime;
      this.atimeMs = this.projectFileStats.atimeMs;
      this.mtime = this.projectFileStats.mtime;
      this.mtimeMs = this.projectFileStats.mtimeMs;
      this.path = this.projectFileStats.path;
    }
  }


  /* getters or setters */

  /* end of getters or setters */  


  /* methods */

  /* getProjectPath */
  // temp project files
  getTempImageFilePath(assetId, fileExtensionWithDot) {    
    return fileSystem.join(this.tempProjectImageDirectoryPath, assetId) + fileExtensionWithDot;
  }

  getTempGifFilePath(assetId, fileExtensionWithDot) {    
    return fileSystem.join(this.tempProjectImageDirectoryPath, assetId) + fileExtensionWithDot;
  }
  
  getTempVideoFilePath(assetId, fileExtensionWithDot) {    
    return fileSystem.join(this.tempProjectImageDirectoryPath, assetId) + fileExtensionWithDot;
  }

  getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(assetPath) {    
    return ProjectFile.isAssetPathRelative(assetPath) ?
      fileSystem.join(this.tempProjectImageDirectoryPath, assetPath) : assetPath;
  }

  // saved project
  static getImageFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {    
    return fileSystem.join(projectDirectoryStructure.image, assetId) + fileExtensionWithDot; 
  }

  static getGifFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {    
    return fileSystem.join(projectDirectoryStructure.gif, assetId) + fileExtensionWithDot; 
  }

  static getVideoFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {    
    return fileSystem.join(projectDirectoryStructure.video, assetId) + fileExtensionWithDot;
  }

  static isAssetPathRelative(assetPath) {
    let isAssetPathRelative = false;
    for (let assetDirectory in projectDirectoryStructure) {    
      if (assetPath.indexOf(projectDirectoryStructure[assetDirectory]) === 0) {
        isAssetPathRelative = true;
        break;
      }
    }
    return isAssetPathRelative;
  }
  /* end of getProjectPath */

  /* saveFilesToTemp */
  static async copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists) {
    if (isAssumeDestDirExists) {    
      await fileSystem.copyFileAssumingDestDirExistsPromise(srcFilePath, destFilePath);
    } else {
      await fileSystem.copyFileAsync(srcFilePath, destFilePath);
    }
  }

  async saveImageToTempAsync(srcFilePath, assetId, isAssumeDestDirExists) {
    const destFilePath = this.getTempImageFilePath(assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
    await this.copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
    return destFilePath;
  }
  
  async saveGifToTempAsync(srcFilePath, assetId, isAssumeDestDirExists) {
    const destFilePath = this.getTempGifFilePath(assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
    await this.copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
    return destFilePath;
  }
  
  async saveVideoToTempAsync(srcFilePath, assetId, isAssumeDestDirExists) {
    const destFilePath = this.getTempVideoFilePath(assetId, fileSystem.getFileExtensionWithLeadingDot(srcFilePath));
    await this.copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
    return destFilePath;
  }
  /* end of saveFilesToTemp */  

  static async getExistingProjectNamesAsync() {
    const projects = await listProjectsAsync();  
    const projectNames = projects.map((project) => {
      return project.name;
    });
    return projectNames;  
  }

  async isProjectFileExistAsync() {
    const projectName = this.name;
    const existingProjectNames = await ProjectFile.getExistingProjectNamesAsync();
    const isTheNamedProjectExist = existingProjectNames.includes(projectName);
    return isTheNamedProjectExist;
  }

  async isProjectNameUsedAsync() {
    const projectName = this.name;
    const existingProjectNames = await ProjectFile.getExistingProjectNamesAsync();
    const isNameUsed = !isCurrentLoadedProject(projectName) && existingProjectNames.includes(projectName);
    return isNameUsed;
  }   

  static async deleteAllTempProjectDirectoriesAsync() {
    await fileSystem.myDeletePromise(appDirectory.appTempProjectsDirectory);
  }

  convertAssetSrcToProperAbsolutePath(assetSrc) {    
    // strip file:/// from asset.src
    const strToStrip = "file:///";  
    if (assetSrc.includes(strToStrip)) {
      assetSrc = assetSrc.substr("file:///".length);
    }
    
    // TODO: this check of relative path is not well thought through!!!
    const absoluteAssetFilePath = 
      this.getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(assetSrc);      
    
    // TODO: check if using decodeURIComponent() here is appropriate
    // https://stackoverflow.com/questions/747641/what-is-the-difference-between-decodeuricomponent-and-decodeuri
    return decodeURIComponent(absoluteAssetFilePath);  
  };
  
  async getAllExistingAssetFileAbsolutePathsInTempAsync() {    
    const projectAssetTempDirectories = this.tempProjectAllAssetsDirectoryPaths;  
    const existingAssetFileAbsolutePathsInTemp = [];
    await forEach(projectAssetTempDirectories, async (assetTempDir) => {    
      const isAssetTempDirExists = await fileSystem.existsPromise(assetTempDir);        
      if (!isAssetTempDirExists) {
        return;
      }    
      const assetFileStatObjs = await fileSystem.readdirWithStatPromise(assetTempDir);    
      for (let assetFileStatObj of assetFileStatObjs) {      
        existingAssetFileAbsolutePathsInTemp.push(assetFileStatObj.path);      
      }
    });
    return existingAssetFileAbsolutePathsInTemp;
  }
  
  async createAssetTempDirectoriesAsync() {
    const projectAssetTempDirectories = this.tempProjectAllAssetsDirectoryPaths;
    await forEach(projectAssetTempDirectories, async (dir) => {        
      await fileSystem.createDirectoryIfNotExistsPromise(dir);
    });
  };

  async deleteAssetTempDirectoriesAsync() {
    const projectAssetTempDirectories = this.tempProjectAllAssetsDirectoryPaths;
    await forEach(projectAssetTempDirectories, async (dir) => {
      await fileSystem.myDeletePromise(dir);
    });
  };

  /* saveProject */
  // check assetsList and project asset temp directories,
  // delete any assets not in assetsList
  async deleteNonUsedAssetsFromTempAsync(assetsList) {
    const projectName = this.name;

    if (!isNonEmptyArray(assetsList)) {
      await this.deleteAssetTempDirectoriesAsync(projectName);
      return;
    }  

    // check assetsList
    const normedAssetSrcAbsolutePaths = assetsList.map((asset) => {
      return fileSystem.normalize(this.convertAssetSrcToProperAbsolutePath(asset.src));
    });
    const normedAssetSrcAbsolutePathsSet = 
      new Set(normedAssetSrcAbsolutePaths);

    // check project asset temp directories
    const existingProjectAssetFileAbsolutePaths = 
      await this.getAllExistingAssetFileAbsolutePathsInTempAsync();
    const normedExistingProjectAssetFileAbsolutePaths = 
      existingProjectAssetFileAbsolutePaths.map((path) => {
        return fileSystem.normalize(path);
      });
    const normedExistingProjectAssetFileAbsolutePathsSet = 
      new Set(normedExistingProjectAssetFileAbsolutePaths);

    // compare assetsList and project asset temp directories
    // set difference
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    const existingProjectAssetFilesNotInAssetsListSet = 
      new Set([...normedExistingProjectAssetFileAbsolutePathsSet].filter(
        x => !normedAssetSrcAbsolutePathsSet.has(x)
      ));

    // for debug only
    // console.log(assetsList);
    // console.log(normedExistingProjectAssetFileAbsolutePathsSet);
    // console.log(normedAssetSrcAbsolutePathsSet);
    // console.log(existingProjectAssetFilesNotInAssetsListSet);

    // delete these no longer used files
    await forEach([...existingProjectAssetFilesNotInAssetsListSet], async (filePath) => {
      await fileSystem.myDeletePromise(filePath);
    });
  };

  // saveAssetsToTempAsync() will do nothing and pass control to callBack
  // if assetsList.length === 0
  async saveAssetsToTempAsync(assetsList) {
    if (!isNonEmptyArray(assetsList)) {    
      return;
    }
    
    await this.createAssetTempDirectoriesAsync();  
  
    const isAssumeProjectAssetTempDirectoriesExists = true;
  
    await forEach(assetsList, async (asset) => {
      const assetSrcAbsolutePath = this.convertAssetSrcToProperAbsolutePath(asset.src);
  
      let saveFileToTempAsyncFunc = null;    
      switch (asset.media_type) {
        case mediaType.image:
          saveFileToTempAsyncFunc = this.saveImageToTempAsync;
          break;
        case mediaType.gif:
          saveFileToTempAsyncFunc = this.saveGifToTempAsync;
          break;
        case mediaType.video:
        default:
          saveFileToTempAsyncFunc = this.saveVideoToTempAsync;
          break;
      }
  
      await saveFileToTempAsyncFunc(assetSrcAbsolutePath, asset.id, 
        isAssumeProjectAssetTempDirectoriesExists);      
    });  
  };

  async saveToLocalDetailAsync(entitiesList, assetsList) {
    const projectName = this.name;

    const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);
    
    // deal with assetsList
    await this.deleteNonUsedAssetsFromTempAsync(assetsList);
    console.log("saveProjectToLocal - deleteNonUsedAssetsFromTempAsync: Done");
  
    await this.saveAssetsToTempAsync(assetsList);
    console.log(`saveProjectToLocal - saveProjectToLocalDetail: Assets saved in ${this.tempProjectDirPath}`);
  
    // TODO: The following modify the objects in the input assetsList directly. Is this alright?
    // modify assets_list node in jsonForSave to reflect the relative paths of the project folder structure to be zipped
    jsonForSave.assets_list.forEach((asset) => {
      let getAssetFilePathRelativeToProjectDirectoryFunc = null;
      switch (asset.media_type) {
        case mediaType.image:
          getAssetFilePathRelativeToProjectDirectoryFunc = ProjectFile.getImageFilePathRelativeToProjectDirectory;
          break;
        case mediaType.gif:
          getAssetFilePathRelativeToProjectDirectoryFunc = ProjectFile.getGifFilePathRelativeToProjectDirectory;  
          break;
        case mediaType.video:
        default:
          getAssetFilePathRelativeToProjectDirectoryFunc = ProjectFile.getVideoFilePathRelativeToProjectDirectory;
          break;
      }
      
      const assetFilePathRelativeToProjectDirectory = 
        getAssetFilePathRelativeToProjectDirectoryFunc(asset.id, fileSystem.getFileExtensionWithLeadingDot(asset.src));
      asset.src = assetFilePathRelativeToProjectDirectory;
    });
  
    // write project json file
    const jsonForSaveStr = JSON.stringify(jsonForSave);
    const tempJsonPath = this.tempProjectJsonFilePath;
    await fileSystem.writeFilePromise(tempJsonPath, jsonForSaveStr);      
    console.log(`saveProjectToLocal - saveProjectToLocalDetail: JSON file saved in ${tempJsonPath}`);
  
    // zip and move temp folder to appProjectsDirectory
    const destProjectPackagePath = this.savedProjectFilePath;
    await fileSystem.createPackagePromise(this.tempProjectDirectoryPath, destProjectPackagePath);
    console.log(`saveProjectToLocal - saveProjectToLocalDetail: Project file saved in ${destProjectPackagePath}`);
        
    setCurrentLoadedProjectFilePath(destProjectPackagePath);
    
    return {
      //tempProjectDirectoryPath: this.tempProjectDirectoryPath,
      //tempJsonPath: tempJsonPath,
      jsonForSave: jsonForSave,
      destProjectPackagePath: destProjectPackagePath
    };
  }

  async saveToLocalAsync(entitiesList, assetsList) {
    const projectName = this.name;

    let savedProjectObj;

    // save in temp folder before zip (in appTempProjectsDirectory)
      
    // check if projectName is already used  
    const isNameUsed = await this.isProjectNameUsedAsync(projectName);

    if (isNameUsed) {      
      const projectNameTakenError = new Error(`Project name "${projectName}" is used`);
      throw projectNameTakenError;
    }

    // check if tempProjectDir already exists, if exists, delete it
    // actually this step may be redundant because I would check isProjectNameUsedAsync    
    if (!isCurrentLoadedProject(projectName)) {      
      await fileSystem.myDeletePromise(this.tempProjectDirectoryPath);
      savedProjectObj = await this.saveToLocalDetailAsync(entitiesList, assetsList);    
    } else {      
      savedProjectObj = await this.saveToLocalDetailAsync(entitiesList, assetsList);
    }

    return savedProjectObj;
  }
  /* end of saveProject */

  /* loadProject */  
  async loadProjectByFilePathAsync() {
    const savedProjectFilePath = this.savedProjectFilePath;

    if (!this.savedProjectFilePath) {
      return null;
    }

    const tempProjectDirectoryPath = this.tempProjectDirectoryPath;

    setCurrentLoadedProjectFilePath(savedProjectFilePath);

    await ProjectFile.deleteAllTempProjectDirectoriesAsync();    
    
    fileSystem.extractAll(savedProjectFilePath, tempProjectDirectoryPath);
    console.log(`loadProject - loadProjectByProjectNameAsync: Project extracted to ${tempProjectDirectoryPath}`);
  
    const projectJsonStr = await fileSystem.readFilePromise(this.tempProjectJsonFilePath);
    //console.log(projectJsonStr);
    console.log(`loadProject - loadProjectByProjectNameAsync: Project ${savedProjectFilePath} json loaded.`);
    
    const projectJson = JSON.parse(projectJsonStr);
    
    // change any relative file path in assets to absolute path
    const assetsList = projectJson.assets_list;
    assetsList.forEach((asset) => {
      asset.src = 
        this.getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(asset.src);
    });
  
    this.projectJson = projectJson;

    return projectJson
  }
  /* end of loadProject */

  /* end of methods */
}


module.exports.ProjectFile = ProjectFile;