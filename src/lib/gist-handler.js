'use strict'
var modalDialogCustom = require('../app/ui/modal-dialog-custom')
// Allowing window to be overriden for testing
function GistHandler (_window) {
  if (_window === undefined) _window = window

  this.handleLoad = function (params, cb) {
    var loadingFromGist = false
    var gistId
    if (params['gist'] === '') {
      modalDialogCustom.prompt(null, 'Enter the URL or ID of the Gist you would like to load.', null, (target) => {
        if (target !== '') {
          gistId = getGistId(target)
          loadingFromGist = !!gistId
        }
      })
    } else {
      gistId = params['gist']
      loadingFromGist = !!gistId
    }
    if (loadingFromGist) {
      cb(gistId)
    }
    return loadingFromGist
  }

  function getGistId (str) {
    var idr = /[0-9A-Fa-f]{8,}/
    var match = idr.exec(str)
    return match ? match[0] : null
  }
}

module.exports = GistHandler
