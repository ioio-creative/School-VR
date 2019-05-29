import path from 'path';


const getFileExtensionWithoutLeadingDot = (filePath) => {
  return path.extname(filePath).substr(1);  
};


export {
  getFileExtensionWithoutLeadingDot
}