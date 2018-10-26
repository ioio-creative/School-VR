// https://github.com/hokein/electron-sample-apps/tree/master/file-explorer

import _ from 'underscore';

const fs = window.require('fs');
const path = window.require('path');
//const _ = window.require('underscore');


const map = {
  'compressed': ['zip', 'rar', 'gz', '7z'],
  'text': ['txt', 'md', ''],
  'image': ['jpg', 'jpge', 'png', 'gif', 'bmp'],
  'pdf': ['pdf'],
  'css': ['css'],
  'html': ['html'],
  'word': ['doc', 'docx'],
  'powerpoint': ['ppt', 'pptx'],
  'movie': ['mkv', 'avi', 'rmvb'],
};

let cached = {};

const stat = (filepath) => {
  var result = {
    name: path.basename(filepath),
    path: filepath,
  };

  try {
    var stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      result.type = 'folder';
    } else {
      var ext = path.extname(filepath).substr(1);
      result.type = cached[ext];
      if (!result.type) {
        for (var key in map) {
          if (_.include(map[key], ext)) {
            cached[ext] = result.type = key;
            break;
          }
        }

        if (!result.type)
          result.type = 'blank';
      }
    }
  } catch (e) {
    window.alert(e);
  }

  return result;
};

export default {
  stat
};
