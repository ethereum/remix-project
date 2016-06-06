function getQueryParams () {
  var qs = window.location.hash.substr(1);

  if (window.location.search.length > 0) {
    // use legacy query params instead of hash
    window.location.hash = window.location.search.substr(1);
    window.location.search = '';
  }

  var params = {};
  var parts = qs.split('&');
  for (var x in parts) {
    var keyValue = parts[x].split('=');
    if (keyValue[0] !== '') {
      params[keyValue[0]] = keyValue[1];
    }
  }
  return params;
}

function updateQueryParams (params) {
  var currentParams = getQueryParams();
  var keys = Object.keys(params);
  for (var x in keys) {
    currentParams[keys[x]] = params[keys[x]];
  }
  var queryString = '#';
  var updatedKeys = Object.keys(currentParams);
  for (var y in updatedKeys) {
    queryString += updatedKeys[y] + '=' + currentParams[updatedKeys[y]] + '&';
  }
  window.location.hash = queryString.slice(0, -1);
}

module.exports = {
  get: getQueryParams,
  update: updateQueryParams,
};