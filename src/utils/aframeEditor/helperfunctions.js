const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

let editor = null;
Events.on('editor-load', obj => {
  editor = obj;
});

function roundTo(num, digit) {
  return Math.round(num * Math.pow(10,digit)) / Math.pow(10,digit);
}

function jsonCopy(src) {
  return JSON.parse(JSON.stringify(src));
}

function rgba2hex(rgb){
  if (!rgb) return '#FFFFFF';
  const parsedrgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (parsedrgb && parsedrgb.length === 4) ? "#" +
  ("0" + parseInt(parsedrgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(parsedrgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(parsedrgb[3],10).toString(16)).slice(-2) : rgb;
}

function isClockwise(vertices=[]) {
  const len = vertices.length;
  let sum = vertices.map(({x, y}, index) => {
      let nextIndex = index + 1;
      if (nextIndex === len) nextIndex = 0;

      return {
          x1: x,
          x2: vertices[nextIndex].x,
          y1: x,
          y2: vertices[nextIndex].x
      }
  });
  console.log(sum);
  sum = sum.map(({ x1, x2, y1, y2}) => ((x2 - x1) * (y1 + y2)));
  console.log(sum);
  sum = sum.reduce((a, b) => a + b);
  console.log(sum);
  if (sum > 0) return true;
  if (sum <= 0) return false;
}

function polygonArea(vertices=[]) {
  const len = vertices.length;
  let sum = 0;
  vertices.forEach(({x, y}, index) => {
      let nextIndex = index + 1;
      if (nextIndex === len) nextIndex = 0;
      sum += x * vertices[nextIndex].y - y * vertices[nextIndex].x;
  });
  return sum;
}

function addToAsset(el) {
    let assetEl = document.querySelector('a-asset');
    if (!assetEl) {
        assetEl = document.createElement('a-asset');
        editor.sceneEl.append(assetEl);
    }
    assetEl.append(el);
    const newId = uuid();
    // switch (el.tagName) {
    //     case 'VIDEO':
    //         el.loop = true;
    //         break;
    //     case 'IMG':
    //         break;
    //     default:
    //         console.log('editorFunctions_addToAsset: ???');
    // }
    el.setAttribute('id', newId);
    return newId;
}

export {roundTo, jsonCopy, rgba2hex, isClockwise, polygonArea, addToAsset}