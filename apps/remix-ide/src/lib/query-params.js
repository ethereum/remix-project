'use strict'

// Allowing window to be overriden for testing
function QueryParams (_window) {
  if (_window === undefined) _window = window

  this.get = function () {
    var qs = _window.location.hash.substr(1)

    if (_window.location.search.length > 0) {
      // use legacy query params instead of hash
      _window.location.hash = _window.location.search.substr(1)
      _window.location.search = ''
    }

    var params = {}
    var parts = qs.split('&')
    for (var x in parts) {
      var keyValue = parts[x].split('=')
      if (keyValue[0] !== '') {
        params[keyValue[0]] = keyValue[1]
      }
    }
    return params
  }

  this.update = function (params) {
    var currentParams = this.get()
    var keys = Object.keys(params)
    for (var x in keys) {
      currentParams[keys[x]] = params[keys[x]]
    }
    var queryString = '#'
    var updatedKeys = Object.keys(currentParams)
    for (var y in updatedKeys) {
      queryString += updatedKeys[y] + '=' + currentParams[updatedKeys[y]] + '&'
    }
    _window.location.hash = queryString.slice(0, -1)
  }
}

module.exports = QueryParams
