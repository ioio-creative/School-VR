import {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';


const deleteAllTempProjectDirectoriesAsync = async () => {
  try {
    await fileSystem.myDeletePromise(appDirectory.appTempProjectsDirectory);
  } catch (err) {
    console.error(err);
    alert(err);
  }
};


export default deleteAllTempProjectDirectoriesAsync;