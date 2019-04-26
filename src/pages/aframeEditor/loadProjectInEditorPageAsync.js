import {loadCurrentLoadedProjectAsync} from 'utils/saveLoadProject/loadProject';

export default async function loadProjectInEditorPageAsync(editorPage) {
  const projectName = editorPage.props.match.params.projectName;
  console.log("project name to load: " + projectName);
  
  if (!projectName) {
    return null;
  }

  const projectJsonData = await loadCurrentLoadedProjectAsync();
  console.log(projectJsonData);
  editorPage.events.loadProject(projectJsonData);
};