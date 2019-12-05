module.exports = function toBase64Str(data) {
  return Buffer.from(data).toString('base64');
};