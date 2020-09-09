const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

/*
  References:
  https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
  https://www.npmjs.com/package/@ffmpeg-installer/ffmpeg
  https://stackoverflow.com/questions/24961127/how-to-create-a-video-from-images-with-ffmpeg

  ffmpeg command:
  ffmpeg -i "C:/Users/IOIO/Desktop/school vr temp/images/%07d.png" -c:v libx264 -vf fps=30 -pix_fmt yuv420p "C:/Users/IOIO/Desktop/school vr temp/videos/new.mp4"
*/
const imageSequenceToVideoPromise = async (
  inputImgFileSelector,
  outputVideoPath,
  fps
) => {
  return await exec(`${ffmpegPath} -i ${inputImgFileSelector} -c:v libx264 -vf fps=${fps} -pix_fmt yuv420p ${outputVideoPath}
  `);
};

module.exports = {
  imageSequenceToVideoPromise
};
