function projectFilePathQuery(filePath) {
  return `projectFilePath=${encodeURIComponent(filePath)}`;
}


const routes = {
    home: "/",
    editor: "/editor",
    editorWithProjectFilePathQuery: function (filePath) {
      return `${this.editor}?${projectFilePathQuery(filePath)}`;
    },
    presenter: "/presenter",
    presenterWithProjectFilePathQuery: function (filePath) {
      return `${this.presenter}?${projectFilePathQuery(filePath)}`;
    },
    viewer: "/viewer",
    projectList: "/projectlist",
    notFound: "/notfound"
}


export default routes;