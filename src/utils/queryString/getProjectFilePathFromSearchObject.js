export default function getProjectFilePathFromSearchObject(searchObj) {
  return searchObj.projectFilePath ? decodeURIComponent(searchObj.projectFilePath) : null;
};