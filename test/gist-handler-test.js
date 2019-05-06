'use strict'
var modalDialogCustom
if (typeof window !== 'undefined') {
  modalDialogCustom = require('../app/ui/modal-dialog-custom')
}
// ^ this class can be load in a non browser context when running node unit testing.
// should not load UI in that case

// Allowing window to be overriden for testing
function GistHandler (_window) {
  if (_window !== undefined) {
    modalDialogCustom = _window
  }

  this.handleLoad = function (params, cb) {
    if (!cb) cb = () => {}
    var loadingFromGist = false
    var gistId
    if (params['gist'] === '') {
      loadingFromGist = true
      modalDialogCustom.prompt(
        'Load a Gist',
        'Enter the URL or ID of the Gist you would like to load.',
        null,
        target => {
          if (target !== '') {
            gistId = getGistId(target)
            if (gistId) {
              cb(gistId)
            }
          }
        }
      )
      return loadingFromGist
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
