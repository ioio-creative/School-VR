import isNumber from 'utils/number/isNumber';

export default function setNumberValueWithDefault(value, defaultValue) {
  return isNumber(value) ? value : defaultValue;
};