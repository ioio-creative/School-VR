/**
 * https://www.npmjs.com/package/ts-ebml
 * https://github.com/legokichi/ts-ebml
 */


import {Decoder, tools, Reader} from 'ts-ebml';


function readAsArrayBufferPromise(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = () => { resolve(reader.result); };
    reader.onerror = (ev) => { reject(ev.error); };
  });
}

// https://github.com/collab-project/videojs-record/issues/317
async function makeVideoSeekableByInjectingMetadataPromise(blob) {
  const decoder = new Decoder();
  const reader = new Reader();
  reader.logging = false;
  reader.drop_default_duration = false;

  // load webm blob and inject metadata
  const buffer = await readAsArrayBufferPromise(blob);
  const elms = decoder.decode(buffer);
  elms.forEach((elm) => { reader.read(elm); });
  reader.stop();

  const refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas, reader.duration, reader.cues);      
  console.log('makeVideoSeekableByInjectingMetadataPromise reader.metadatas:', reader.metadatas);      
  const body = buffer.slice(reader.metadataSize);
  const resultedBlob = new Blob([refinedMetadataBuf, body],
      {type: blob.type});  

  // the blob object contains the recorded data that
  // can be downloaded by the user, stored on server etc.
  console.log('makeVideoSeekableByInjectingMetadataPromise resultedBlob:', resultedBlob);

  return resultedBlob;
}


export {
  makeVideoSeekableByInjectingMetadataPromise
};