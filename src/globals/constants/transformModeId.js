const transformModeId = {};
['translate', 'rotate', 'scale'].forEach(id => {
  transformModeId[id] = id;
});

export default transformModeId;