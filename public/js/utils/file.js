const fs = require('fs');

const readFile = (filepath) => {
  fs.readFile(filepath, 'utf-8', function (err, data) {
    if (err) {
      alert("An error ocurred reading the file :" + err.message);
      return;
    }

    document.getElementById("content-editor").value = data;
  });
};

const deleteFile = (filepath) => {
  if (fs.existsSync(filepath)) {
    // File exists deletings
    fs.unlink(filepath, function (err) {
      if (err) {
        alert("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }
    });
  } else {
    alert("This file doesn't exist, cannot delete");
  }
};

const saveChanges = (filepath, content) => {
  fs.writeFile(filepath, content, function (err) {
    if (err) {
      alert("An error ocurred updating the file" + err.message);
      console.log(err);
      return;
    }

    alert("The file has been succesfully saved");
  });
};

const writeFile = (filepath, content, errCallBack) => {
  fs.writeFile(fileName, content, errCallBack);  
};

export {
  readFile,
  deleteFile,
  saveChanges,
  writeFile
}