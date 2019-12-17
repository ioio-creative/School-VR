const {config, appDirectory} = require('../../globals/config');

const uuid = require('uuid/v1');
const ExifTool = require("exiftool-vendored").ExifTool;

const myPath = require('../fileSystem/myPath');
const fileSystem = require('../fileSystem/fileSystem');

const FfmpegCommand = require('../ffmpeg/ffmpegCommand');


const writeMetaDataTo360ImageTimeoutInMillis = 5000;

const writeMetaDataTo360ImagePromise = async (imgPath) => {
  // https://www.npmjs.com/package/exiftool-vendored
  const exiftool = new ExifTool({ taskTimeoutMillis: writeMetaDataTo360ImageTimeoutInMillis });
  // https://medium.com/hackernoon/capture-facebook-compatible-4k-360-videos-of-3d-scenes-in-your-browser-788226f2c75f
  await exiftool.write(imgPath, {
    ProjectionType: 'equirectangular'
  });
};

const write360ImageToPath = async (path, imgBase64Str) => {
  await fileSystem.base64DecodePromise(path, imgBase64Str);
  await writeMetaDataTo360ImagePromise(path);
}

const write360ImageToTempPromise = async (imgBase64Str) => {
  const tmpImgId = uuid();
  const tmpImgDirectoryName = tmpImgId;
  const tmpImgFilePath = myPath.join(appDirectory.appTempCapturesContainerDirectory, tmpImgDirectoryName, tmpImgId) + config.captured360ImageExtension;
  await write360ImageToPath(tmpImgFilePath, imgBase64Str);
  return tmpImgFilePath;
};

const write360ImageAsPartOfVideoToTempPromise = async (videoUuid, currentFrame, imgBase64Str) => {
  const tmpImgFilePath = myPath.join(appDirectory.appTempCapturesContainerDirectory, videoUuid, String(currentFrame).padStart(5, '0')) + config.captured360ImageExtension;
  console.log(tmpImgFilePath);
  await write360ImageToPath(tmpImgFilePath, imgBase64Str);
  return tmpImgFilePath;
};

const convertImageSequencesToVideoPromise = async (imgSeqDir, outVideoPath, fps) => {
  FfmpegCommand
  
};

module.exports = {
  write360ImageToTempPromise,
  write360ImageAsPartOfVideoToTempPromise,
  convertImageSequencesToVideoPromise
};