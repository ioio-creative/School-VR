function projectFilePathQuery(filePath) {
  return `projectFilePath=${encodeURIComponent(filePath)}`;
}


const routes = {
    home: "/",
    editor: "/editor/:projectId?",
    editorWithProjectFilePathQuery: function (filePath) {
      return `/editor?${projectFilePathQuery(filePath)}`;
    },
    presenter: "/presenter/:projectId?",
    viewer: "/viewer",
    projectList: "/projectlist",
    notFound: "/notfound"
}


export default routes;