const {config, appDirectory} = require('../../globals/config');

const uuid = require('uuid/v1');
const ExifTool = require("exiftool-vendored").ExifTool;

const myPath = require('../fileSystem/myPath');
const fileSystem = require('../fileSystem/fileSystem');


const writeMetaDataTo360ImageTimeoutInMillis = 5000;

const writeMetaDataTo360ImagePromise = async (imgPath) => {
  // https://www.npmjs.com/package/exiftool-vendored
  const exiftool = new ExifTool({ taskTimeoutMillis: writeMetaDataTo360ImageTimeoutInMillis });
  // https://medium.com/hackernoon/capture-facebook-compatible-4k-360-videos-of-3d-scenes-in-your-browser-788226f2c75f
  await exiftool.write(imgPath, {
    ProjectionType: 'equirectangular'
  });
};

const write360ImageToTempPromise = async (imgBase64Str) => {
  const tmpImgId = uuid();
  const tmpImgDirectoryName = tmpImgId;
  const tmpImgFilePath = myPath.join(appDirectory.appTempCapturesContainerDirectory, tmpImgDirectoryName, tmpImgId) + config.captured360ImageExtendsion;
  await fileSystem.base64DecodePromise(tmpImgFilePath, imgBase64Str);
  await writeMetaDataTo360ImagePromise(tmpImgFilePath);
  return tmpImgFilePath;
};


module.exports = {
  write360ImageToTempPromise
};