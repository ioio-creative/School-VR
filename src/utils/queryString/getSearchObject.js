function getSearchObjectFromHistory(history) {
  return getSearchObjectFromLocation(history.location);
};

function getSearchObjectFromLocation(location = window.location) {
  return getSearchObjectFromQueryString(location.search);
};

// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/
function getSearchObjectFromQueryString(queryStr = window.location.search) {
  const searchParams = new URLSearchParams(queryStr);

  const searchHandler = {
    get: function(obj, prop) {
      return obj.has(prop) ? obj.get(prop) : null;
    }
  }

  return new Proxy(searchParams, searchHandler);
};


export {
  getSearchObjectFromQueryString,
  getSearchObjectFromLocation,
  getSearchObjectFromHistory 
};