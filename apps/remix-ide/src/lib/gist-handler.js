'use strict'
var modalDialogCustom = require('../app/ui/modal-dialog-custom')
var request = require('request')

// Allowing window to be overriden for testing
function GistHandler (_window) {
  if (_window !== undefined) {
    modalDialogCustom = _window
  }

  this.handleLoad = function (params, cb) {
    if (!cb) cb = () => {}
    var loadingFromGist = false
    var gistId
    if (params.gist === '') {
      loadingFromGist = true
      modalDialogCustom.prompt('Load a Gist', 'Enter the ID of the Gist or URL you would like to load.', null, (target) => {
        if (target !== '') {
          gistId = getGistId(target)
          if (gistId) {
            cb(gistId)
          } else {
            modalDialogCustom.alert('Gist load error', 'Error while loading gist. Please provide a valid Gist ID or URL.')
          }
        }
      })
      return loadingFromGist
    } else {
      gistId = params.gist
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

  this.loadFromGist = (params, fileManager) => {
    const self = this
    return self.handleLoad(params, function (gistId) {
      request.get({
        url: `https://api.github.com/gists/${gistId}`,
        json: true
      }, async (error, response, data = {}) => {
        if (error || !data.files) {
          modalDialogCustom.alert('Gist load error', error || data.message)
          return
        }
        const obj = {}
        Object.keys(data.files).forEach((element) => {
          const path = element.replace(/\.\.\./g, '/')

          obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
        })

        await fileManager.setBatchFiles(obj, 'workspace', true, (errorLoadingFile) => {
          if (!errorLoadingFile) {
            console.log('gist loaded')
            const provider = fileManager.getProvider('workspace')
            provider.lastLoadedGistId = gistId
          } else {
            modalDialogCustom.alert('Gist load error', errorLoadingFile.message || errorLoadingFile)
          }
        })
      })
    })
  }
}

module.exports = GistHandler
