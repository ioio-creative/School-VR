// const jsonStringifyFormatted = ('../json/jsonStringifyFormatted');

const parseDataToSaveFormat = (projectName, entitiesList, assetsList) => {
  const resultJson = {
    projectName: projectName,
    entitiesList: entitiesList,
    assetsList: assetsList
  };
  //console.log(jsonStringifyFormatted(resultJson));
  return resultJson;
};

module.exports = parseDataToSaveFormat;