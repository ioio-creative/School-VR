const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

let editor = null;
Events.on('editor-load', obj => {
  editor = obj;
});

function roundTo(num, digit) {
  return Math.round(num * Math.pow(10,digit)) / Math.pow(10,digit);
}
/**
 * https://jsperf.com/deep-copy-vs-json-stringify-json-parse/5
 * @param {jsonObject} o 
 */
function jsonCopy(o) {
  var newO,
    i;

  if (typeof o !== 'object') {
    return o;
  }
  if (!o) {
    return o;
  }

  if ('[object Array]' === Object.prototype.toString.apply(o)) {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = jsonCopy(o[i]);
    }
    return newO;
  }
  if ('[object HTMLElement]' === Object.prototype.toString.apply(o)) {
    return o;
  }

  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = jsonCopy(o[i]);
    }
  }
  return newO;
}
// function jsonCopy(src) {
//   return JSON.parse(JSON.stringify(src));
// }

function rgba2hex(rgb){
  if (!rgb) return '#FFFFFF';
  const parsedrgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (parsedrgb && parsedrgb.length === 4) ? "#" +
  ("0" + parseInt(parsedrgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(parsedrgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(parsedrgb[3],10).toString(16)).slice(-2) : rgb;
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

export {roundTo, jsonCopy, rgba2hex, addToAsset}