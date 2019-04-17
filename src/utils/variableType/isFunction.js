/**
 * Return if the input object is a function
 * @method isFunction
 * @param {object} obj
 * @return {boolean} indicating if obj is a function
 */
function isFunction(obj) {
  return typeof(obj) === "function";
}

function invokeIfIsFunction(obj) {
  if (isFunction(obj)) {
    obj(...arguments);
  }
}


export default isFunction;

export {
  invokeIfIsFunction
};