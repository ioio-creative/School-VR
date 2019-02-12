import getExistingProjectNamesAsync  from './getExistingProjectNamesAsync';

const isProjectExistAsync = async (projectNameToCheck) => {
  const existingProjectNames = await getExistingProjectNamesAsync();
  const isTheNamedProjectExist = existingProjectNames.includes(projectNameToCheck);
  return isTheNamedProjectExist;
}

export default isProjectExistAsync;