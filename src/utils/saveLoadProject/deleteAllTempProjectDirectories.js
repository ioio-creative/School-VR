


const deleteAllTempProjectDirectories = () => {
  try {
    fileSystem.myDeleteSync(appDirectory.appTempProjectsDirectory);
  } catch (err) {
    console.error(err);
    alert(err);
  }
};


export default deleteAllTempProjectDirectories;