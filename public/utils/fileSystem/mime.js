// https://github.com/hokein/electron-sample-apps/tree/master/file-explorer

const myPath = require('./myPath');


const map = {
  'compressed': ['zip', 'rar', 'gz', '7z'],
  'text': ['txt', 'md', ''],
  'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
  'pdf': ['pdf'],
  'css': ['css'],
  'html': ['html'],
  'word': ['doc', 'docx'],
  'powerpoint': ['ppt', 'pptx'],
  'movie': ['mkv', 'avi', 'rmvb'],
};

let cached = {};

const statSync = (filepath) => {
  const result = {
    name: myPath.getFileNameWithExtension(filepath),
    path: filepath
  };

  if (fileSystem.isDirectorySync(filepath)) {
    result.type = 'folder';
  } else {
    const ext = myPath.getFileExtensionWithoutLeadingDot(filepath);
    result.type = cached[ext];
    if (!result.type) {
      for (let key in map) {
        if (map[key].includes(ext.toLowerCase())) {
          cached[ext] = result.type = key;
          break;
        }
      }

      if (!result.type)
        result.type = 'blank';
    }
  }

  return result;
};


module.exports.statSync = statSync;