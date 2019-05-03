import isNumber from './isNumber';

export default function setNumberValueWithDefault(value, defaultValue) {
  return isNumber(value) ? value : defaultValue;
};