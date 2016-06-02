var queryParams = require('./query-params');

function handleLoad(cb) {
  var params = queryParams.get();
  var loadingFromGist = false;
  if (typeof params['gist'] !== undefined) {
    var gistId;
    if (params['gist'] === '') {
      var str = prompt('Enter the URL or ID of the Gist you would like to load.');
      if (str !== '') {
        gistId = getGistId( str );
        loadingFromGist = !!gistId;
      }
    } else {
      gistId = params['gist'];
      loadingFromGist = !!gistId;
    }
    if (loadingFromGist) cb(gistId);
  }
  return loadingFromGist;
}

function getGistId(str) {
  var idr = /[0-9A-Fa-f]{8,}/;
  var match = idr.exec(str);
  return match ? match[0] : null;
}

module.exports = {
  handleLoad: handleLoad
};
