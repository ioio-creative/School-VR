function extractBase64StrFromHtmlFileReader(resultStrFromFileReader) {
  const strToFind = "base64,";
  const idxOfStrToFind = resultStrFromFileReader.indexOf(strToFind);
  return resultStrFromFileReader.substr(idxOfStrToFind + strToFind.length);
}

export default extractBase64StrFromHtmlFileReader;
