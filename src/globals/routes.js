const routes = {
    home: "/",
    editorByProjectName: "/editor/:projectName",
    editorByProjectNameWithValue: function (projectName) {
      return `/editor/${projectName}`;
    },
    presenter: "/presenter",
    viewer: "/viewer",
    projectList: "/projectlist",
    notFound: "/notfound"
}

export default routes;