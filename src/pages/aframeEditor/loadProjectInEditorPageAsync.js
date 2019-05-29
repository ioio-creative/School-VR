import getSearchObjectFromHistory from 'utils/queryString/getSearchObjectFromHistory';
import getProjectFilePathFromSearchObject from 'utils/queryString/getProjectFilePathFromSearchObject';
import ipcHelper from 'utils/ipcHelper';


export default async function loadProjectInEditorPageAsync(editorPage) {
  const searchObj = getSearchObjectFromHistory(editorPage.props.history);
  const projectFilePathToLoad = getProjectFilePathFromSearchObject(searchObj);
  
  //console.log("project path to load: " + projectFilePathToLoad);
  
  if (!projectFilePathToLoad) {
    return null;
  }

  ipcHelper.loadProjectByProjectFilePath(projectFilePathToLoad, (err, data) => {
    if (err) {
      handleErrorWithUiDefault(err);
      return;                         
    }
    
    const projectJsonData = data.projectJson;
    //console.log(projectJsonData);
    editorPage.events.loadProject(projectJsonData);    
  });  
};