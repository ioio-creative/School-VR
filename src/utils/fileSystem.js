// https://ourcodeworld.com/articles/read/106/how-to-choose-read-save-delete-or-create-a-file-with-electron-framework

import toBase64Str from 'utils/base64/toBase64Str';
import fromBase64Str from 'utils/base64/fromBase64Str';

// https://github.com/electron/asar
// http://www.tc4shell.com/en/7zip/asar/
// Somehow using the "import" syntax would result in the following error:
// "Module not found: Can't resolve 'original-fs' in 'E:\Documents\Projects\Electron\School-VR\node_modules\asar\lib'"
//import asar from 'asar';
const asar = window.require('asar');

const fs = window.require('fs');
const path = window.require('path');



const handleGeneralErr = (callBack, err) => {
  handleGeneralErrAndData(callBack, err);
};

const handleGeneralErrAndData = (callBack, err, data) => {
  const callBackCall = (newErr) => {
    callBack && callBack(newErr);
  };
  if (err) {
    console.error(err.stack);
    callBackCall(err, null);
  } else {
    callBackCall(null, data);    
  }
};


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

// https://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-doesnt-exist
const writeFile = (filePath, content, callBack) => {
  const directoriesStr = path.dirname(filePath);
  const writeFileCallBack = () => {
    fs.writeFile(filePath, content, (err) => {
      handleGeneralErr(callBack, err);
    });
  }
  exists(directoriesStr, (err) => {
    if (err) {  // directory does not exist
      //console.log(err);
      mkdir(directoriesStr, { recursive: true }, (err) => {    
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

const writeFileSync = (filePath, content) => {
  const directoriesStr = path.dirname(filePath);
  if (!existsSync(directoriesStr)) {
    mkdirSync(directoriesStr);
  }
  fs.writeFileSync(filePath, content);
};

const createWriteStream = (outputPath) => {
  return fs.createWriteStream(outputPath);
};

const rename = (oldPath, newPath, callback) => {
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
}

const deleteFileSafe = (filePath, callBack) => {
  if (existsSync(filePath)) {
    
  } else {
    callBack(new Error("This file doesn't exist, cannot delete"));
  }

  exists(filePath, (err) => {
    if (err) {  // file does not exist
      handleGeneralErr(callBack, null);
    } else {  // file exists      
      fs.unlink(filePath, (err) => {
        handleGeneralErr(callBack, err);
      });
    }
  });
}

const deleteFileSafeSync = (filePath) => {
  if (existsSync(filePath)) {  // file exists    
    fs.unlinkSync(filePath);
  }
};

const saveChangesToFile = (filepath, content, callBack) => {
  writeFile(filepath, content, callBack);
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
    (err) => { handleGeneralErr(callBack, err); })
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
      console.log(`${src} packaged to ${dest}`);
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

const defaultMkDirOptions = {
  recursive: true
};

const mkdir = (dirPath, callBack) => {
  fs.mkdir(dirPath, defaultMkDirOptions, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const mkdirSync = (dirPath) => {
  fs.mkdirSync(dirPath, defaultMkDirOptions);
}

const createDirectoryIfNotExists = (dirPath, callBack) => {  
  exists(dirPath, (existsErr) => {    
    if (existsErr) {  // directory does not exist
      mkdir(dirPath, (mkDirErr) => {
        handleGeneralErr(callBack, mkDirErr);
      });
    } else {  // directory exists
      handleGeneralErr(callBack, null);
    }
  })
};

// https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
const createDirectoryIfNotExistsSync = (dirPath) => {  
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
};

// TODO:
const createAndOverwriteDirectoryIfExists = (dirPath) => {
  
}

const readdir = (dirPath, callBack) => {
  fs.readdir(dirPath, (err, files) => {
    handleGeneralErrAndData(callBack, err, files);
  });
};

const readdirSync = (dirPath) => {
  return fs.readdirSync(dirPath);
}

const rmdir = (dirPath, callBack) => {
  fs.rmdir(dirPath, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const rmdirSync = (dirPath) => {
  fs.rmdirSync(dirPath);
};

/* end of directory api */


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

/* end of path api */


export default {
  // file api
  exists,
  existsSync,
  writeFile,
  writeFileSync,
  createWriteStream,
  rename,
  renameSync,
  readFile,
  readFileSync,
  deleteFileSafe,
  deleteFileSafeSync,
  saveChangesToFile,  
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
  readdir,
  readdirSync,
  rmdir,
  rmdirSync,

  // path api
  sep,
  getFileExtensionWithLeadingDot,
  getFileExtensionWithoutLeadingDot,
  getFileNameWithExtension,
  getFileNameWithoutExtension,
  join,
  resolve,
  normalize
};
