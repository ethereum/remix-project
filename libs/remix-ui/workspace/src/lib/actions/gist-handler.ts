// var modalDialogCustom = require('../app/ui/modal-dialog-custom')
import * as request from 'request'

export class GistHandler {
  handleLoad (params) {
    let loadingFromGist = false
    let gistId

    if (params.gist) {
      loadingFromGist = true
    } else {
      gistId = params.gist
      loadingFromGist = !!gistId
    }

    return gistId
  }

  getGistId (str: string) {
    const idr = /[0-9A-Fa-f]{8,}/
    const match = idr.exec(str)

    return match ? match[0] : null
  }

  loadFromGist (params, fileManager) {
    const gistId = this.handleLoad(params)

    request.get({
      url: `https://api.github.com/gists/${gistId}`,
      json: true
    }, async (error, response, data = {}) => {
      if (error || !data.files) {
        // modalDialogCustom.alert('Gist load error', error || data.message)
        return
      }
      const obj = {}

      Object.keys(data.files).forEach((element) => {
        const path = element.replace(/\.\.\./g, '/')

        obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
      })
      fileManager.setBatchFiles(obj, 'workspace', true, (errorLoadingFile) => {
        if (!errorLoadingFile) {
          const provider = fileManager.getProvider('workspace')

          provider.lastLoadedGistId = gistId
        } else {
          // modalDialogCustom.alert('Gist load error', errorLoadingFile.message || errorLoadingFile)
        }
      })
    })
  }
}
