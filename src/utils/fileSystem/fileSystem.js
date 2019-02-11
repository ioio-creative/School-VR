// https://ourcodeworld.com/articles/read/106/how-to-choose-read-save-delete-or-create-a-file-with-electron-framework

import rimraf from 'rimraf';
import fx from './mkdir-recursive';

import toBase64Str from 'utils/base64/toBase64Str';
import fromBase64Str from 'utils/base64/fromBase64Str';

import isFunction from 'utils/variableType/isFunction';

// https://github.com/electron/asar
// http://www.tc4shell.com/en/7zip/asar/
// Somehow using the "import" syntax would result in the following error:
// "Module not found: Can't resolve 'original-fs' in 'E:\Documents\Projects\Electron\School-VR\node_modules\asar\lib'"
//import asar from 'asar';
const asar = window.require('asar');

const fs = window.require('fs');
const path = window.require('path');


/* error handling */

const passbackControlToCallBack = (callBack, data) => {
  handleGeneralErrAndData(callBack, null, data);
};

const handleGeneralErr = (callBack, err) => {
  handleGeneralErrAndData(callBack, err);
};

const handleGeneralErrAndData = (callBack, err, data) => {
  console.log("fileSystem handleGeneralErrAndData");  
  const callBackCall = (newErr, theData) => {
    isFunction(callBack) && callBack(newErr, theData);
  };
  if (err) {
    console.error(err.stack);
    callBackCall(err, null);
  } else {
    callBackCall(null, data);    
  }
};

/* end of error handling */


/* file api */

//const useFileHandle = (filePath, )

// https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
const exists = (filePath, callBack) => {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    callBack(err);  // would throw error if callBack is undefined
  });
};

const existsSync = (filePath) => {
  return fs.existsSync(filePath);
};

// for performance reasons
const writeFileAssumingDestDirExists = (filePath, content, callBack) => {
  fs.writeFile(filePath, content, (err) => {
    handleGeneralErr(callBack, err);
  });
}

/**
 * writeFile would create any parent directories in filePath if not exist.
 * writeFile would replace the file if already exists. (same behaviour as fs.writeFile)
 * https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
 * https://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-doesnt-exist
 */
const writeFile = (filePath, content, callBack) => {
  const directoriesStr = dirname(filePath);
  const writeFileCallBack = () => {
    fs.writeFile(filePath, content, (err) => {
      handleGeneralErr(callBack, err);
    });
  };
  exists(directoriesStr, (err) => {
    if (err) {  // directory does not exist
      //console.log(err);
      createDirectoryIfNotExists(directoriesStr, (err) => {    
        if (err) {
          handleGeneralErr(callBack, err);
          return;
        }    
        writeFileCallBack();
      });      
    } else {  // directory exists
      writeFileCallBack();
    }
  });
};

// for performance reasons
const writeFileAssumingDestDirExistsSync = (filePath, content) => {
  fs.writeFileSync(filePath, content);
}

const writeFileSync = (filePath, content) => {
  const directoriesStr = dirname(filePath);
  if (!existsSync(directoriesStr)) {
    createDirectoryIfNotExistsSync(directoriesStr);
  }
  fs.writeFileSync(filePath, content);
};

const createWriteStream = (outputPath) => {
  return fs.createWriteStream(outputPath);
};

const rename = (oldPath, newPath, callBack) => {
  fs.rename(oldPath, newPath, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const renameSync = (oldPath, newPath) => {
  fs.renameSync(oldPath, newPath);
};

const readFile = (filePath, callBack) => {
  //fs.readFile(filePath, 'utf-8', (err, data) => {
  fs.readFile(filePath, (err, data) => {
    handleGeneralErrAndData(callBack, err, data);
  });
};

const readFileSync = (filePath) => {
  return fs.readFileSync(filePath);
};

// for performance reasons
const copyFileAssumingDestDirExists = (src, dest, callBack) => {
  if (src === dest) {
    passbackControlToCallBack(callBack, null);
    return;
  }

  fs.copyFile(src, dest, (err) => {
    handleGeneralErr(callBack, err);
  });
}

/**
 * copyFile and copyFileSync is structurally similar to writeFile and writeFileSync
 * copyFile would create any parent directories in filePath if not exist.
 * copyFile would replace the file if already exists. (at least that what I think)
 */
const copyFile = (src, dest, callBack) => {
  if (src === dest) {
    passbackControlToCallBack(callBack, null);
    return;
  }

  const destDirectoriesStr = dirname(dest);
  const copyFileCallBack = () => {
    fs.copyFile(src, dest, (err) => {
      handleGeneralErr(callBack, err);
    });
  };
  exists(destDirectoriesStr, (err) => {
    if (err) {  // directory does not exist
      createDirectoryIfNotExists(destDirectoriesStr, (err) => {
        if (err) {          
          handleGeneralErr(callBack, err);
          return;
        }        
        copyFileCallBack();        
      });
    } else {  // directory exists
      copyFileCallBack();
    }
  });
};

// for performance reasons
const copyFileAssumingDestDirExistsSync = (src, dest) => {
  if (src === dest) {    
    return;
  }

  fs.copyFileSync(src, dest);
}

const copyFileSync = (src, dest) => {
  if (src === dest) {   
    return;
  }

  const destDirectoriesStr = dirname(dest);
  if (!existsSync(destDirectoriesStr)) {
    createDirectoryIfNotExistsSync(destDirectoriesStr);
  }
  fs.copyFileSync(src, dest);  
};

/**
 * fs.unlink() will not work on a directory, empty or otherwise. To remove a directory, use fs.rmdir()
 * https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback
 */
// const deleteFileSafe = (filePath, callBack) => {
//   exists(filePath, (err) => {
//     if (err) {  // file does not exist
//       passbackControlToCallBack(callBack);
//     } else {  // file exists      
//       fs.unlink(filePath, (err) => {
//         handleGeneralErr(callBack, err);
//       });
//     }
//   });
// }

// const deleteFileSafeSync = (filePath) => {
//   if (existsSync(filePath)) {  // file exists    
//     fs.unlinkSync(filePath);
//   }
// };

const saveChangesToFile = (filepath, content, callBack) => {
  writeFile(filepath, content, callBack);
};

const stat = (filePath, callBack) => {
  fs.stat(filePath, (err, stats) => {
    handleGeneralErrAndData(err, stats);
  });
};

const statSync = (filePath) => {
  return fs.statSync(filePath);
};

const isDirectory = (filePath, callBack) => {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      handleGeneralErr(err);
      return;
    }
    handleGeneralErrAndData(callBack, null, stats.isDirectory());
  })
};

const isDirectorySync = (filePath) => {
  return fs.statSync(filePath).isDirectory();
};

const base64Encode = (filePath, callBack) => {
  readFile(filePath, (err, data) => {
    handleGeneralErrAndData(callBack, err, data);
  });
};

// https://stackoverflow.com/questions/24523532/how-do-i-convert-an-image-to-a-base64-encoded-data-url-in-sails-js-or-generally
const base64EncodeSync = (filePath) => {
  // read binary data
  const data = readFileSync(filePath);
  // convert binary data to base64 encoded string
  return toBase64Str(data);
}

const base64Decode = (locationToSaveFile, encodedStr, callBack) => {
  writeFile(locationToSaveFile, 
    fromBase64Str(encodedStr),
    (err) => { handleGeneralErr(callBack, err); });
};

const base64DecodeSync = (locationToSaveFile, encodedStr) => {
  writeFileSync(locationToSaveFile, 
    fromBase64Str(encodedStr));
};

/* end of file api */


/* asar - Electron Archive https://github.com/electron/asar/blob/master/lib/asar.js */

const createPackage = (src, dest, callBack) => {
  // https://github.com/electron/asar#transform
  // passing null as 3rd argument won't work
  // should pass {} (empty value) or _ => null (a function which returns nothing) or anything other than null or undefined
  createPackageWithOptions(src, dest, {}, callBack);  
};

const createPackageWithTransformOption = (src, dest, transformFunc, callBack) => {
  createPackageWithOptions(src, dest, { transform: transformFunc }, callBack);
};

// overwrite existing dest
const createPackageWithOptions = (src, dest, options, callBack) => {
  //console.log(asar);  
  asar.createPackageWithOptions(src, dest, options, (err) => {
    if (!err) {
      console.log(`fileSystem - createPackageWithOptions: ${src} packaged to ${dest}`);
    }
    
    handleGeneralErr(callBack, err);
  });
};

const extractAll = (archive, dest) => {
  // asar would cache previous result!
  asar.uncache(archive);
  //asar.uncacheAll();
  // overwrite existing dest!
  asar.extractAll(archive, dest);
};

/* end of asar - Electron Archive */


/* directory api */

// somehow this is not working
// const defaultMkDirOptions = {
//   recursive: true
// };

// const mkdir = (dirPath, callBack) => {
//   fs.mkdir(dirPath, defaultMkDirOptions, (err) => {
//     handleGeneralErr(callBack, err);
//   });
// };

// const mkdirSync = (dirPath) => {
//   fs.mkdirSync(dirPath, defaultMkDirOptions);
// }

// use fx instead of fs
const mkdir = (dirPath, callBack) => {
  fx.mkdir(fs, path, dirPath, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const mkdirSync = (dirPath) => {
  fx.mkdirSync(fs, path, dirPath);
}

const createDirectoryIfNotExists = (dirPath, callBack) => {  
  exists(dirPath, (existsErr) => {    
    if (existsErr) {  // directory does not exist      
      mkdir(dirPath, (mkDirErr) => {
        handleGeneralErr(callBack, mkDirErr);
      });
    } else {  // directory exists
      passbackControlToCallBack(callBack);
    }
  })
};

// https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
const createDirectoryIfNotExistsSync = (dirPath) => {  
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
};

// https://askubuntu.com/questions/517329/overwrite-an-existing-directory
const createAndOverwriteDirectoryIfExists = (dirPath, callBack) => {
  myDelete(dirPath, (err) => {
    if (err) {
      handleGeneralErr(callBack, err);
    } else {
      mkdir(dirPath, (err) => {
        handleGeneralErr(callBack, err);
      });
    }
  });
}

const createAndOverwriteDirectoryIfExistsSync = (dirPath) => {
  myDeleteSync(dirPath);
  mkdirSync(dirPath);
}

// Note: files are just file names, not full paths
const readdir = (dirPath, callBack) => {
  fs.readdir(dirPath, (err, files) => {
    handleGeneralErrAndData(callBack, err, files);
  });
};

const readdirSync = (dirPath) => {
  return fs.readdirSync(dirPath);
}

// const rmdir = (dirPath, callBack) => {
//   fs.rmdir(dirPath, (err) => {
//     handleGeneralErr(callBack, err);
//   });
// };

// const rmdirSync = (dirPath) => {
//   fs.rmdirSync(dirPath);
// };

// const deleteDirectorySafe = (dirPath, callBack) => {  
//   exists(dirPath, (err) => {
//     if (err) {  // dir does not exist
//       passbackControlToCallBack(callBack);      
//     } else {  // dir exists      
//       fs.rmdir(dirPath, (err) => {
//         handleGeneralErr(callBack, err);        
//       });
//     }
//   });
// }

// const deleteDirectorySafeSync = (dirPath) => {
//   if (existsSync(dirPath)) {  // dir exists    
//     fs.rmdirSync(dirPath);
//   }
// };

/* end of directory api */


/**
 * rimraf api
 * work for both file and directory 
 * https://github.com/isaacs/rimraf
 */

const defaultMyDeleteOptions = Object.assign({
  maxBusyTries: 15
} , fs);

const myDelete = (filePath, callBack) => {
  rimraf(filePath, defaultMyDeleteOptions, (err) => {    
    handleGeneralErr(callBack, err);        
  });  
};

const myDeleteSync = (filePath) => {
  rimraf.sync(filePath, defaultMyDeleteOptions);
}

/* end of del api */


/* path api */

const sep = path.sep;

const getFileExtensionWithLeadingDot = (filePath) => {
  return path.extname(filePath);
};

const getFileExtensionWithoutLeadingDot = (filePath) => {
  return path.extname(filePath).substr(1);
};

const getFileNameWithExtension = (filePath) => {
  return path.basename(filePath);
};

const getFileNameWithoutExtension = (filePath) => {
  // https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
  return path.basename(filePath).split('.').slice(0, -1).join('.');
};

const join = (...paths) => {  
  return path.join(...paths);
};

const resolve = (...paths) => {
  return path.resolve(...paths);
}

const normalize = (filePath) => {
  return path.normalize(filePath);
}

const dirname = (filePath) => {
  return path.dirname(filePath);
}

/* end of path api */


export default {
  // error handling
  passbackControlToCallBack,
  handleGeneralErr,
  handleGeneralErrAndData,

  // file api
  exists,
  existsSync,
  writeFileAssumingDestDirExists,
  writeFile,
  writeFileAssumingDestDirExistsSync,
  writeFileSync,
  createWriteStream,
  rename,
  renameSync,
  readFile,
  readFileSync,
  copyFileAssumingDestDirExists,
  copyFile,
  copyFileAssumingDestDirExistsSync,
  copyFileSync,
  //deleteFileSafe,
  //deleteFileSafeSync,
  saveChangesToFile,
  stat,
  statSync,
  isDirectory,
  isDirectorySync,
  base64Encode,
  base64EncodeSync,
  base64Decode,
  base64DecodeSync,

  // asar - Electron Archive
  createPackage,
  createPackageWithTransformOption, 
  createPackageWithOptions,
  extractAll,

  // directory api
  //mkdir,
  //mkdirSync,
  createDirectoryIfNotExists,
  createDirectoryIfNotExistsSync,
  createAndOverwriteDirectoryIfExists,
  createAndOverwriteDirectoryIfExistsSync,
  readdir,
  readdirSync,
  //deleteDirectorySafe,
  //deleteDirectorySafeSync,

  // rimraf api
  myDelete,
  myDeleteSync,

  // path api
  sep,
  getFileExtensionWithLeadingDot,
  getFileExtensionWithoutLeadingDot,
  getFileNameWithExtension,
  getFileNameWithoutExtension,
  join,
  resolve,
  normalize,
  dirname
};
