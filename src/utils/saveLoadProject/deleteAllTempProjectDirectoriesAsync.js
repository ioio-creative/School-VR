import {appDirectory} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';


const deleteAllTempProjectDirectoriesAsync = async () => {  
  await fileSystem.myDeletePromise(appDirectory.appTempProjectsDirectory);  
};


export default deleteAllTempProjectDirectoriesAsync;