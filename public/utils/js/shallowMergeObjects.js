function shallowMergeObjects(obj) {
  if (arguments.length === 0) {
    return null;
  }

  if (arguments.length === 1) {
    return obj;
  }

  const argumentsArray = Array.prototype.slice.call(arguments);
  return Object.assign(...argumentsArray);
}

module.exports = shallowMergeObjects;