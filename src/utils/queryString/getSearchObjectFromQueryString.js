// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/
export default function getSearchObjectFromQueryString(queryStr) {
  const searchParams = new URLSearchParams(queryStr);

  const searchHandler = {
    get: function(obj, prop) {
      return obj.has(prop) ? obj.get(prop) : null;
    }
  }

  return new Proxy(searchParams, searchHandler);
};