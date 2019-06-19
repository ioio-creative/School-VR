import path from 'path';
import mimeTypes from 'mime-types';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';


/* path api */

const sep = path.sep;

const getFileExtensionWithLeadingDot = (filePath) => {
  return path.extname(filePath);
};

const getFileExtensionWithoutLeadingDot = (filePath) => {
  return path.extname(filePath).substr(1);
};

const getFileNameWithExtension = (filePath) => {
  // TODO:
  const customedSep = '\\';
  const filePathComponents = filePath.split(customedSep);
  if (isNonEmptyArray(filePathComponents)) {
    return filePathComponents[filePathComponents.length - 1];
  } else {
    return "";
  }  
};

const getFileNameWithoutExtension = (filePath) => {
  // https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript  
  //return path.basename(filePath).split('.').slice(0, -1).join('.');

  return getFileNameWithExtension(filePath).split('.').slice(0, -1).join('.');
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


/* mime-types api */

const getMimeType = (filePath) => {
  const ext = getFileExtensionWithoutLeadingDot(filePath);
  const mime = mimeTypes.lookup(ext);  
  return mime;
};

/* end of mime-types api */


export default {
  // path api
  sep,
  getFileExtensionWithLeadingDot,
  getFileExtensionWithoutLeadingDot,
  getFileNameWithExtension,
  getFileNameWithoutExtension,
  join,
  resolve,
  normalize,
  dirname,

  // mime-types api
  getMimeType,
}