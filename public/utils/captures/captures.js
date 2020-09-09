const electron = require('electron');
const app = electron.app;
const appName = app.getName();

const { config, appDirectory } = require('../../globals/config');

const uuid = require('uuid/v1');
const ExifTool = require('exiftool-vendored').ExifTool;
const sphericalMetadata = require('@bubltechnology/spherical-metadata');

const myPath = require('../fileSystem/myPath');
const fileSystem = require('../fileSystem/fileSystem');

//const FfmpegCommand = require('../ffmpeg/ffmpegCommand');
const { imageSequenceToVideoPromise } = require('../ffmpeg/ffmpegProcess');

/* constants */

const writeMetaDataTo360ImageTimeoutInMillis = 5000;
const numOfDigitsInImgSeqFileName = 7;

/* end of constants */

/* temp image sequence file paths */

const getTempCaptureUniqueDirectoryPath = videoUuid => {
  return myPath.join(appDirectory.appTempCapturesContainerDirectory, videoUuid);
};

const getTempImageSequenceDirectoryPath = videoUuid => {
  return myPath.join(getTempCaptureUniqueDirectoryPath(videoUuid), 'images');
};

const getTempImageSequenceFilePath = (videoUuid, currentFrame) => {
  return (
    myPath.join(
      getTempImageSequenceDirectoryPath(videoUuid),
      String(currentFrame).padStart(numOfDigitsInImgSeqFileName, '0')
    ) + config.captured360ImageExtension
  );
};

const getTempImageSequenceFileSelectorForFfmpeg = videoUuid => {
  // e.g. 'assets/demo1/Sinewave3-1920x1080_%03d.png'
  return (
    myPath.join(
      getTempImageSequenceDirectoryPath(videoUuid),
      `%0${numOfDigitsInImgSeqFileName}d`
    ) + config.captured360ImageExtension
  );
};

const getTempVideoOutputFilePath = videoUuid => {
  return (
    myPath.join(getTempCaptureUniqueDirectoryPath(videoUuid), videoUuid) +
    config.captured360VideoExtension
  );
};

/* end of temp image sequence file paths */

/* writing meta-data */

const writeMetaDataTo360ImagePromise = async imgPath => {
  // https://www.npmjs.com/package/exiftool-vendored
  const exiftool = new ExifTool({
    taskTimeoutMillis: writeMetaDataTo360ImageTimeoutInMillis
  });
  // https://medium.com/hackernoon/capture-facebook-compatible-4k-360-videos-of-3d-scenes-in-your-browser-788226f2c75f
  await exiftool.write(imgPath, {
    ProjectionType: 'equirectangular'
  });
};

const writeMetaDataTo360VideoPromise = async (
  existingVideoPath,
  newVideoPath
) => {
  // sphericalMetadata.injectMetadata() returns a promise.
  return sphericalMetadata.injectMetadata({
    source: existingVideoPath,
    destination: newVideoPath,
    software: appName,
    projection: 'equirectangular',
    sourceCount: 4
  });
};

/* end of writing meta-data */

const write360ImageToPath = async (
  path,
  imgBase64Str,
  isWrite360ImgMeta = true
) => {
  await fileSystem.base64DecodePromise(path, imgBase64Str);
  if (isWrite360ImgMeta) {
    await writeMetaDataTo360ImagePromise(path);
  }
};

const write360ImageToTempPromise = async imgBase64Str => {
  const tmpImgId = uuid();
  const tmpImgDirectoryName = tmpImgId;
  const tmpImgFilePath =
    myPath.join(
      appDirectory.appTempCapturesContainerDirectory,
      tmpImgDirectoryName,
      tmpImgId
    ) + config.captured360ImageExtension;
  await write360ImageToPath(tmpImgFilePath, imgBase64Str, true);
  return tmpImgFilePath;
};

const write360ImageAsPartOfVideoToTempPromise = async (
  videoUuid,
  currentFrame,
  imgBase64Str
) => {
  const tmpImgFilePath = getTempImageSequenceFilePath(videoUuid, currentFrame);
  console.log(tmpImgFilePath);
  await write360ImageToPath(tmpImgFilePath, imgBase64Str, false);
  return tmpImgFilePath;
};

const convertTempImageSequenceToVideoPromise = async (videoUuid, fps) => {
  const inputImgFileSelector = getTempImageSequenceFileSelectorForFfmpeg(
    videoUuid
  );
  const outputVideoPath = getTempVideoOutputFilePath(videoUuid);
  //const inputFps = fps;
  //const outputFps = fps;

  /* ffmpegCommand version */

  //const command = new ffmpegCommand();

  // const handleImageSequenceToVideoEnd = async _ => {
  //   console.log('convertTempImageSequenceToVideoPromise: Finished processing');
  //   // const outputVideoWithMetaDataPath =
  //   //   myPath.getFileNameWithDirectoryWithoutExtension(outputVideoPath) + '_withmeta' +
  //   //   config.captured360VideoExtension;
  //   // await writeMetaDataTo360VideoPromise(
  //   //   outputVideoPath,
  //   //   outputVideoWithMetaDataPath
  //   // );
  // };

  // const result = command.imageSequenceToVideo(
  //   inputImgFileSelector,
  //   inputFps,
  //   outputVideoPath,
  //   outputFps,
  //   handleImageSequenceToVideoEnd
  // );
  // console.log('result:', result);

  /* end of ffmpegCommand version */

  /* ffmpegProcess version */

  // https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
  const { stdout, stderr } = await imageSequenceToVideoPromise(
    inputImgFileSelector,
    outputVideoPath,
    fps
  );
  if (stdout) {
    console.log('imageSequenceToVideoPromise stdout:', stdout);
  }
  if (stderr) {
    console.log('imageSequenceToVideoPromise stderr:', stderr);
    //throw new Error(stderr);
  }

  console.log(
    'convertTempImageSequenceToVideoPromise: Writing metadata to 360 video'
  );

  const outputVideoWithMetaDataPath =
    myPath.getFileNameWithDirectoryWithoutExtension(outputVideoPath) +
    '_withmeta' +
    config.captured360VideoExtension;
  await writeMetaDataTo360VideoPromise(
    outputVideoPath,
    outputVideoWithMetaDataPath
  );

  console.log('convertTempImageSequenceToVideoPromise: Finished processing');

  /* end of ffmpegProcess version */

  return outputVideoWithMetaDataPath;
};

module.exports = {
  write360ImageToTempPromise,
  write360ImageAsPartOfVideoToTempPromise,
  convertTempImageSequenceToVideoPromise
};
