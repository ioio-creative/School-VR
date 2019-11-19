// https://www.npmjs.com/package/macaddress
const macaddress = require('macaddress');
const {promisify} = require('util');

const getMacAddressHelper = {
  one: macaddress.one,
  all: macaddress.all,
  networkInterfaces: macaddress.networkInterfaces
};

const getMacAddressPromiseHelper = {};
Object.keys(getMacAddressHelper).forEach((key) => {
  getMacAddressPromiseHelper[key] = promisify(getMacAddressHelper[key]);
});

module.exports = {
  getMacAddressHelper,
  getMacAddressPromiseHelper
};