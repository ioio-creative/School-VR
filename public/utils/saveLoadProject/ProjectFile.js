const {forEach, filter} = require('p-iteration');
const {config, mediaType, appDirectory, projectDirectoryStructure} = require('../../globals/config');
const fileSystem = require('../fileSystem/fileSystem');
const myPath = require('../fileSystem/myPath');
const CustomedFileStats = require('../fileSystem/CustomedFileStats');
const isNonEmptyArray = require('../variableType/isNonEmptyArray');
const parseDataToSaveFormat = require('./parseDataToSaveFormat');


/* current loaded project (singleton) */
/* somehow static properties seem not yet supported in Node */

currentLoadedProjectFilePath = null;

/* end of current loaded project (singleton) */


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
      this.savedProjectFilePath = myPath.join(appDirectory.appProjectsDirectory, this.name) + config.schoolVrProjectArchiveExtensionWithLeadingDot;
    }

    if (projectFilePath) {
      if (!this.name) {
        this.name = myPath.getFileNameWithoutExtension(projectFilePath);
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
    this.tempProjectDirectoryPath = myPath.join(appDirectory.appTempProjectsDirectory, this.name);
    this.tempProjectImageDirectoryPath = myPath.join(this.tempProjectDirectoryPath, projectDirectoryStructure.image);
    this.tempProjectGifDirectoryPath = myPath.join(this.tempProjectDirectoryPath, projectDirectoryStructure.gif);
    this.tempProjectVideoDirectoryPath = myPath.join(this.tempProjectDirectoryPath, projectDirectoryStructure.video);
    this.tempProjectAllAssetsDirectoryPaths = [
      this.tempProjectImageDirectoryPath,
      this.tempProjectGifDirectoryPath,
      this.tempProjectVideoDirectoryPath
    ];
    // temp project files
    this.tempProjectJsonFilePath = myPath.join(this.tempProjectDirectoryPath, this.name + config.jsonFileExtensionWithLeadingDot);
    // web server project directories
    this.webServerProjectDirectoryPath = '';    

    // fileStats properties
    if (this.projectFileStats) {
      // https://nodejs.org/api/fs.html#fs_stats_ctime
      this.atime = this.projectFileStats.atime;
      this.atimeMs = this.projectFileStats.atimeMs;
      this.mtime = this.projectFileStats.mtime;
      this.mtimeMs = this.projectFileStats.mtimeMs;
      this.path = this.projectFileStats.path;
    }


    // bind methods
    [
      'getTempImageFilePath',
      'getTempGifFilePath',
      'getTempVideoFilePath',
      'getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative',

      'saveImageToTempAsync',
      'saveGifToTempAsync',
      'saveVideoToTempAsync',

      'isProjectFileExistAsync',
      'isProjectNameUsedAsync',

      'convertAssetSrcToProperAbsolutePath',
      'getAllExistingAssetFileAbsolutePathsInTempAsync',
      'createAssetTempDirectoriesAsync',
      'deleteAssetTempDirectoriesAsync',

      'deleteNonUsedAssetsFromTempAsync',
      'saveAssetsToTempAsync',
      'saveToLocalDetailAsync',
      'saveToLocalAsync',
      'loadProjectAsync',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }


  /* getters or setters */

  /* end of getters or setters */  


  /* methods */

  /* getProjectPath */
  // temp project files
  getTempImageFilePath(assetId, fileExtensionWithDot) {    
    return myPath.join(this.tempProjectImageDirectoryPath, assetId) + fileExtensionWithDot;
  }

  getTempGifFilePath(assetId, fileExtensionWithDot) {    
    return myPath.join(this.tempProjectGifDirectoryPath, assetId) + fileExtensionWithDot;
  }
  
  getTempVideoFilePath(assetId, fileExtensionWithDot) {    
    return myPath.join(this.tempProjectVideoDirectoryPath, assetId) + fileExtensionWithDot;
  }

  getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(assetPath) {    
    return ProjectFile.isAssetPathRelative(assetPath) ?
      myPath.join(this.tempProjectDirectoryPath, assetPath) : assetPath;
  }

  // saved project
  static getImageFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {    
    return myPath.join(projectDirectoryStructure.image, assetId) + fileExtensionWithDot; 
  }

  static getGifFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {    
    return myPath.join(projectDirectoryStructure.gif, assetId) + fileExtensionWithDot; 
  }

  static getVideoFilePathRelativeToProjectDirectory(assetId, fileExtensionWithDot) {    
    return myPath.join(projectDirectoryStructure.video, assetId) + fileExtensionWithDot;
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
    const destFilePath = this.getTempImageFilePath(assetId, myPath.getFileExtensionWithLeadingDot(srcFilePath));
    await ProjectFile.copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
    return destFilePath;
  }
  
  async saveGifToTempAsync(srcFilePath, assetId, isAssumeDestDirExists) {
    const destFilePath = this.getTempGifFilePath(assetId, myPath.getFileExtensionWithLeadingDot(srcFilePath));    
    await ProjectFile.copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
    return destFilePath;
  }
  
  async saveVideoToTempAsync(srcFilePath, assetId, isAssumeDestDirExists) {
    const destFilePath = this.getTempVideoFilePath(assetId, myPath.getFileExtensionWithLeadingDot(srcFilePath));
    await ProjectFile.copyFileAsync(srcFilePath, destFilePath, isAssumeDestDirExists);
    return destFilePath;
  }
  /* end of saveFilesToTemp */


  /* listProjects */
  static funcFactoryForCompareFileStatsByProperty(fileStatPropSelectFunc, isOrderByDesc = false) {
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
  }

  static async listProjectsAsync() {
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
    const compareFileStatsByAccessTimeDesc = ProjectFile.funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.atimeMs, true);
    //const compareFileStatsByModifiedTimeDesc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.mtimeMs, true);

    const sortedFileStatObjs = 
      filteredFileStatObjs.sort(compareFileStatsByAccessTimeDesc);

    const sortedProjectFileObjs = sortedFileStatObjs.map(fileStatObj => new ProjectFile(null, null, fileStatObj));
    
    return sortedProjectFileObjs;
  }

  static async getExistingProjectNamesAsync() {
    const projects = await ProjectFile.listProjectsAsync();  
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
    // TODO: isCurrentLoadedProject now is checking project file path instead of project name
    const isNameUsed = !ProjectFile.isCurrentLoadedProject(projectName) && existingProjectNames.includes(projectName);
    return isNameUsed;
  }
  /* end of listProjects */


  static async deleteAllTempProjectDirectoriesAsync() {    
    await fileSystem.myDeletePromise(appDirectory.appTempProjectsDirectory);
  }

  convertAssetSrcToProperAbsolutePath(assetSrc) {    
    // strip file:/// from asset.src
    const strToStrip = "file:///";  
    if (assetSrc.includes(strToStrip)) {
      assetSrc = assetSrc.substr(strToStrip.length);
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
      return myPath.normalize(this.convertAssetSrcToProperAbsolutePath(asset.src));
    });
    const normedAssetSrcAbsolutePathsSet = 
      new Set(normedAssetSrcAbsolutePaths);

    // check project asset temp directories
    const existingProjectAssetFileAbsolutePaths = 
      await this.getAllExistingAssetFileAbsolutePathsInTempAsync();
    const normedExistingProjectAssetFileAbsolutePaths = 
      existingProjectAssetFileAbsolutePaths.map((path) => {
        return myPath.normalize(path);
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
      switch (asset.type) {
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
    // when using constructor new ProjectFile(null, projectFilePath, null),
    // this.name depends on projectFilePath => correct behaviour
    const projectName = this.name;
    
    const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);    
    // deal with assetsList
    await this.deleteNonUsedAssetsFromTempAsync(assetsList);
    console.log("saveProjectToLocal - deleteNonUsedAssetsFromTempAsync: Done");    
    await this.saveAssetsToTempAsync(assetsList);
    console.log(`saveProjectToLocal - saveProjectToLocalDetail: Assets saved in ${this.tempProjectDirectoryPath}`);    
    // TODO: The following modify the objects in the input assetsList directly. Is this alright?
    // modify assetsList node in jsonForSave to reflect the relative paths of the project folder structure to be zipped
    jsonForSave.assetsList.forEach((asset) => {
      let getAssetFilePathRelativeToProjectDirectoryFunc = null;
      switch (asset.type) {
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
        getAssetFilePathRelativeToProjectDirectoryFunc(asset.id, myPath.getFileExtensionWithLeadingDot(asset.src));
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
        
    ProjectFile.setCurrentLoadedProjectFilePath(destProjectPackagePath);
    
    return {
      //tempProjectDirectoryPath: this.tempProjectDirectoryPath,
      //tempJsonPath: tempJsonPath,
      jsonForSave: jsonForSave,
      destProjectPackagePath: destProjectPackagePath
    };
  }

  async saveToLocalAsync(entitiesList, assetsList) {
    let savedProjectObj;

    // save in temp folder before zip (in appTempProjectsDirectory)
      
    // check if projectName is already used
    // TODO: do we need to check isProjectNameUsedAsync() ?
    // const isNameUsed = await this.isProjectNameUsedAsync(projectName);

    // if (isNameUsed) {      
    //   const projectNameTakenError = new Error(`Project name "${projectName}" is used`);
    //   throw projectNameTakenError;
    // }

    // check if tempProjectDir already exists, if exists, delete it
    // actually this step may be redundant because I would check isProjectNameUsedAsync        
    if (!ProjectFile.isCurrentLoadedProject(this.savedProjectFilePath)) {
      //console.log("is not current loaded project");
      await fileSystem.myDeletePromise(this.tempProjectDirectoryPath);            
      savedProjectObj = await this.saveToLocalDetailAsync(entitiesList, assetsList);      
    } else {
      //console.log("is current loaded project");
      savedProjectObj = await this.saveToLocalDetailAsync(entitiesList, assetsList);      
    }

    return savedProjectObj;
  }
  /* end of saveProject */

  /* loadProject */
  async loadProjectAsync() {
    const savedProjectFilePath = this.savedProjectFilePath;

    if (!savedProjectFilePath) {
      return null;
    }

    const tempProjectDirectoryPath = this.tempProjectDirectoryPath;

    ProjectFile.setCurrentLoadedProjectFilePath(savedProjectFilePath);

    await ProjectFile.deleteAllTempProjectDirectoriesAsync();    
    
    fileSystem.extractAll(savedProjectFilePath, tempProjectDirectoryPath);
    console.log(`loadProject - loadProjectByProjectNameAsync: Project extracted to ${tempProjectDirectoryPath}`);
  
    const projectJsonStr = await fileSystem.readFilePromise(this.tempProjectJsonFilePath);
    //console.log(projectJsonStr);
    console.log(`loadProject - loadProjectByProjectNameAsync: Project ${savedProjectFilePath} json loaded.`);
    
    const projectJson = JSON.parse(projectJsonStr);
    
    // change any relative file path in assets to absolute path    
    const assetsList = projectJson.assetsList;    
    assetsList.forEach((asset) => {
      const assetSrc = asset.src;
      asset.src = 
        this.getTempProjectAssetAbsolutePathFromProvidedPathIfIsRelative(assetSrc);
      // keep reference to any relative path for web server presentation
      asset.relativeSrc = assetSrc;        
    });
  
    this.projectJson = projectJson;

    return projectJson;
  }

  static async loadProjectByFilePathAsync(filePath) {
    const projectFile = new ProjectFile(null, filePath, null);
    return await projectFile.loadProjectAsync();
  }
  /* end of loadProject */


  /* current loaded project (singleton) */

  // Note: may not be good idea to expose this method
  static setCurrentLoadedProjectFilePath(projectFilePath) {
    currentLoadedProjectFilePath = projectFilePath;
  };

  static isCurrentLoadedProject(aFilePath) {
    return currentLoadedProjectFilePath === aFilePath;
  };

  static async loadCurrentLoadedProjectAsync() {    
    return await ProjectFile.loadProjectByFilePathAsync(currentLoadedProjectFilePath);
  };

  /* end of current loaded project (singleton) */


  /* end of methods */
}


module.exports = ProjectFile;