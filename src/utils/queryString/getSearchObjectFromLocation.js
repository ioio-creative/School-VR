import getSearchObjectFromQueryString from './getSearchObjectFromQueryString';

export default function getSearchObjectFromLocation(location) {
  return getSearchObjectFromQueryString(location.search);
};