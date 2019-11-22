import getSearchObjectFromLocation from './getSearchObjectFromLocation';

export default function getSearchObjectFromHistory(history) {
  return getSearchObjectFromLocation(history.location);
};