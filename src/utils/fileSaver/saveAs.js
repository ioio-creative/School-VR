/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
 * https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
 * https://www.npmjs.com/package/file-saver
 * @param {Object} obj - A File, Blob or MediaSource object to create an object URL for.
 * @param {string} fileName - The placeholder name of the file to be saved, appearing in the Save Dialog.
 */
const saveAs = (obj, fileName = 'untitled') => {
  const url = URL.createObjectURL(obj);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  console.log('object url:', url);
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default saveAs;