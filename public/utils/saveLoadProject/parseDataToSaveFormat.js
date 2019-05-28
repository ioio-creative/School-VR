const parseDataToSaveFormat = (projectName, entitiesList, assetsList) => {
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
      });
      entityEntry["slides"].push(slideEntry);
    });
    resultJson["entities_list"].push(entityEntry);
  });
  // TODO: assets_list
  assetsList.forEach(asset => {
    resultJson["assets_list"].push(asset);
  })
  return resultJson;
};

module.exports.parseDataToSaveFormat = parseDataToSaveFormat;
