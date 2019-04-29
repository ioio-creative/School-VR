function projectFilePathQuery(filePath) {
  return `projectFilePath=${encodeURIComponent(filePath)}`;
}


const routes = {
    home: "/",
    editor: "/editor",
    editorWithProjectFilePathQuery: function (filePath) {
      return `/editor?${projectFilePathQuery(filePath)}`;
    },
    presenter: "/presenter",
    viewer: "/viewer",
    projectList: "/projectlist",
    notFound: "/notfound"
}


export default routes;