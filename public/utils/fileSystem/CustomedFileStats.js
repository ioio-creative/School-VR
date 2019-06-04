const myPath = require('./myPath');


class CustomedFileStats {
  /**
   * 
   * @param {fs.Stats} fsStats 
   * @param {String} filePath
   */
  constructor(fsStats, filePath) {
    for (let key in fsStats) {
      this[key] = fsStats[key];
    }
  
    this.path = filePath;    
  }

  get fileNameWithExtension() {
    return myPath.getFileNameWithExtension(this.path);
  }

  get fileNameWithoutExtension() {
    return myPath.getFileNameWithoutExtension(this.path);
  }

  get fileExtensionWithLeadingDot() {    
    return myPath.getFileExtensionWithLeadingDot(this.path);
  }

  get fileExtensionWithoutLeadingDot() {
    return getFileExtensionWithLeadingDot.getFileExtensionWithoutLeadingDot(this.path);
  }
}

module.exports = CustomedFileStats;