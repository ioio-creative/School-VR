// https://www.npmjs.com/package/macaddress
const macaddress = require('macaddress');

const getMacAddressHelper = {
  one: macaddress.one,
  all: macaddress.all,
  networkInterfaces: macaddress.networkInterfaces
};

module.exports = getMacAddressHelper;