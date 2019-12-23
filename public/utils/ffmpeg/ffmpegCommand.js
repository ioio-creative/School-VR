// https://cliffordhall.com/2016/10/creating-video-server-node-js/

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const command = ffmpeg();


function FfmpegCommand() {
  this.command = ffmpeg();
}

/* example:

// Use FFMpeg to create a video.
// 8 consecutive frames, held for 5 seconds each, 30fps output, no audio
command
  .input('assets/demo1/Sinewave3-1920x1080_%03d.png')
  .inputFPS(1/5)
  .output('assets/demo1/Sinewave3-1920x1080.mp4')
  .outputFPS(30)
  .noAudio()
  .run();

*/

FfmpegCommand.prototype.imageSequenceToVideo = 
  function(inputImgFileSelector, inputFps, outputVideoPath, outputFps, onEnd, onProgress, onError) {
    // Use FFMpeg to create a video.
    // 8 consecutive frames, held for 5 seconds each, 30fps output, no audio
    return command
      .on('end', onEnd || handleEnd)
      .on('progress', onProgress || handleProgress)
      .on('error', onError || handleError)
      .input(inputImgFileSelector)
      .inputFPS(inputFps)
      .output(outputVideoPath)
      .outputFPS(outputFps)
      .noAudio()
      .run();
  };

let timemark;

function handleProgress(progress){
  if (progress.timemark != timemark) {
    timemark = progress.timemark;
    console.log('Time mark: ' + timemark + "...");
  }
}
  
function handleError(err, stdout, stderr) {
  console.log('Cannot process video: ' + err.message);
}
  
function handleEnd() {
  console.log('Finished processing');
}


module.exports = FfmpegCommand;