import getSearchObjectFromHistory from 'utils/queryString/getSearchObjectFromHistory';
import getProjectFilePathFromSearchObject from 'utils/queryString/getProjectFilePathFromSearchObject';
import {loadProjectByProjectFilePathAsync} from 'utils/saveLoadProject/loadProject';


export default async function loadProjectInEditorPageAsync(editorPage) {
  const searchObj = getSearchObjectFromHistory(editorPage.props.history);
  const projectFilePathToLoad = getProjectFilePathFromSearchObject(searchObj);
  
  console.log("project path to load: " + projectFilePathToLoad);
  
  if (!projectFilePathToLoad) {
    return null;
  }

  const projectJsonData = await loadProjectByProjectFilePathAsync(projectFilePathToLoad);
  console.log(projectJsonData);
  editorPage.events.loadProject(projectJsonData);
};