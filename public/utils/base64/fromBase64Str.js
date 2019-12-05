module.exports = function fromBase64Str(base64EncodedStr) {
  return Buffer.from(base64EncodedStr, 'base64');
};