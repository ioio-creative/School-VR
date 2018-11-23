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


/* file api */

// https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
const exists = (filePath, callBack) => {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    callBack(err);
  });
};

// https://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-doesnt-exist
const writeFile = (filePath, content, callBack) => {
  const directoriesStr = path.dirname(filePath);
  const writeFileCallBack = () => {
    fs.writeFile(filePath, content, (err) => {      
      callBack(err);
    });
  }
  exists(directoriesStr, (err) => {
    if (err) {  // directory does not exist
      //console.log(err);
      fs.mkdir(directoriesStr, { recursive: true }, (err) => {    
        if (err) {
          return callBack(err);      
        }    
        writeFileCallBack();
      });      
    } else {  // directory exists
      writeFileCallBack();
    }
  })  
};

const writeFileSync = (filePath, content) => {
  const directoriesStr = path.dirname(filePath);
  if (!fs.existsSync(directoriesStr)) {
    fs.mkdirSync(directoriesStr, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

const createWriteStream = (outputPath) => {
  return fs.createWriteStream(outputPath);
}

const rename = (oldPath, newPath, callback) => {

};

const readFile = (filePath, callBack) => {
  //fs.readFile(filePath, 'utf-8', (err, data) => {
  fs.readFile(filePath, (err, data) => {
    callBack(err, data);
  });
};

const readFileSync = (filePath) => {
  return fs.readFileSync(filePath);
}

const deleteFile = (filePath, callBack) => {
  if (fs.existsSync(filePath)) {
    // File exists deletings
    fs.unlink(filePath, (err) => {
      callBack(err);
    });
  } else {
    callBack(new Error("This file doesn't exist, cannot delete"));
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
    if (err) {
      callBack(err, null);
    } else {
      callBack(null, toBase64Str(data));
    }
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
    (err) => { callBack(err); })
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
    if (err) {
      console.error(err.stack);
      callBack && callBack(err);
      return;
    }
    console.log(`${src} packaged to ${dest}`);
    callBack && callBack(null);
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

// https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
const createDirectoryIfNotExistsSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

const readDirectory = (dirPath, callBack) => {
  fs.readdir(dirPath, (error, files) => {
    callBack(error, files);
  });
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
  writeFile,
  writeFileSync,
  createWriteStream,
  rename,
  readFile,
  readFileSync,
  deleteFile,
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
  createDirectoryIfNotExistsSync,
  readDirectory,

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
