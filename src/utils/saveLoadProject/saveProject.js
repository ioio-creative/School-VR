import config from 'globals/config';
import fileSystem from 'utils/fileSystem';

function parseDataToSaveFormat(projectName, entitiesList, assetsList) {
  const resultJson = {
    "project_name": projectName,
    "entities_list": [],
    "assets_list": []
  };
  Object.keys(entitiesList).forEach(entityId => {
    const currentEntity = entitiesList[entityId];
    const entityEntry = {
      "id": entityId,
      "name": currentEntity["name"],
      "entity_type": currentEntity["type"],
      "slides": []
    };
    Object.keys(currentEntity["slide"]).forEach(slideId => {
      const currentSlide = currentEntity["slide"][slideId];
      const slideEntry = {
        "id": slideId,
        "timelines": []
      };
      Object.keys(currentSlide["timeline"]).forEach(timelineId => {
        slideEntry["timelines"].push({
          "id": timelineId,
          ...currentSlide["timeline"][timelineId]
        })
      })
      entityEntry["slides"].push(slideEntry);
    })
    resultJson["entities_list"].push(entityEntry);
  })
  // TODO: assets_list
  return resultJson;
};

const saveProjectToLocal = (projectName, entitiesList, assetsList) => {
  const jsonForSave = parseDataToSaveFormat(projectName, entitiesList, assetsList);
  const jsonForSaveStr = JSON.stringify(jsonForSave);

  // save in temp folder before zip (in appTempWorkingDirectory)
  // TODO: check if projectName is already used
  // TODO: check if tempProjectDir already exists
  const tempProjectDirPath = fileSystem.join(config.appTempWorkingDirectory, projectName);
  const tempJsonPath = fileSystem.join(tempProjectDirPath, projectName + config.jsonFileExtensionWithLeadingDot);

  // zip and move temp folder to appDataDirectory
  // TODO: delete temp folder and zip after move


  return jsonForSave;
};

export {
  parseDataToSaveFormat,
  saveProjectToLocal
};