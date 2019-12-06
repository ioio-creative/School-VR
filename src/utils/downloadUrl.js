// https://stackoverflow.com/questions/3916191/download-data-url-file
const downloadUrl = (url, fileName) => {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
}

export default downloadUrl;