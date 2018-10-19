const fs = window.require('fs');

const writeFile = (filepath, content, callBack) => {
  fs.writeFile(filepath, content, callBack);  
};
const readFile = (filepath, callBack) => {
  fs.readFile(filepath, 'utf-8', callBack);
};

const deleteFile = (filepath, callBack) => {
  if (fs.existsSync(filepath)) {
    // File exists deletings
    fs.unlink(filepath, callBack);
  } else {
    alert("This file doesn't exist, cannot delete");
  }
};

const saveChanges = (filepath, content, callBack) => {
  fs.writeFile(filepath, content, callBack);
};

export default {
  readFile,
  deleteFile,
  saveChanges,
  writeFile
};
