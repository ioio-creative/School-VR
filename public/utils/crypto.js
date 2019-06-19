const crypto = require('crypto');


function cleanString(str) {
  return str.replace(/[\\\/\.]/g, '');
}

// https://medium.com/@chris_72272/what-is-the-fastest-node-js-hashing-algorithm-c15c1a0e164e
function someHash(data) {
  const sha1Hash = crypto.createHash('sha1');
  const intermediateResult = sha1Hash.update(data).digest('base64');
  const result = cleanString(intermediateResult);
  return result;
}

function hashForUniqueId(data) {
  return someHash(data);
}


module.exports = {
  hashForUniqueId
};