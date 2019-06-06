const parseDataToSaveFormat = (projectName, entitiesList, assetsList) => {
  const resultJson = {
    projectName: projectName,
    entitiesList: entitiesList,
    assetsList: assetsList
  };
  //console.log(JSON.stringify(resultJson));
  return resultJson;
};

module.exports = parseDataToSaveFormat;