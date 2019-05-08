'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var css = require('./styles/renderer-styles')
var globlalRegistry = require('../../global/registry')

/**
 * After refactor, the renderer is only used to render error/warning
 * TODO: This don't need to be an object anymore. Simplify and just export the renderError function.
 *
 */
function Renderer (localRegistry) {
  const self = this
  self._components = {}
  self._components.registry = localRegistry || globlalRegistry
  // dependencies
  self._deps = {
    fileManager: self._components.registry.get('filemanager').api,
    config: self._components.registry.get('config').api
  }
  if (document && document.head) {
    document.head.appendChild(css)
  }
}

Renderer.prototype._error = function (file, error) {
  const self = this
  const editor = self._components.registry.get('editor').api
  if (file === self._deps.config.get('currentFile')) {
    editor.addAnnotation(error)
  }
}

Renderer.prototype._errorClick = function (errFile, errLine, errCol) {
  const self = this
  const editor = self._components.registry.get('editor').api
  if (errFile !== self._deps.config.get('currentFile')) {
    // TODO: refactor with this._components.contextView.jumpTo
    var provider = self._deps.fileManager.fileProviderOf(errFile)
    if (provider) {
      provider.exists(errFile, (error, exist) => {
        if (error) return console.log(error)
        self._deps.fileManager.switchFile(errFile)
        editor.gotoLine(errLine, errCol)
      })
    }
  } else {
    editor.gotoLine(errLine, errCol)
  }
}

/**
 * format msg like error or warning,
 *
 * @param {String or DOMElement} message
 * @param {DOMElement} container
 * @param {Object} options {useSpan, noAnnotations, click:(Function), type:(warning, error, staticAnalysisWarning), errFile, errLine, errCol}
 */
Renderer.prototype.error = function (message, container, opt) {
  if (!message) return
  if (container === undefined) return
  opt = opt || {}

  var text
  if (typeof message === 'string') {
    text = message
    message = yo`<span>${message}</span>`
  } else if (message.innerText) {
    text = message.innerText
  }

  var errLocation = text.match(/^([^:]*):([0-9]*):(([0-9]*):)? /)
  if (errLocation) {
    errLocation = parseRegExError(errLocation)
    opt.errFile = errLocation.errFile
    opt.errLine = errLocation.errLine
    opt.errCol = errLocation.errCol
  }

  if (!opt.noAnnotations && errLocation) {
    this._error(errLocation.errFile, {
      row: errLocation.errLine,
      column: errLocation.errCol,
      text: text,
      type: opt.type
    })
  }

  var $pre = $(opt.useSpan ? yo`<span></span>` : yo`<pre></pre>`).html(message)

  let classList = opt.type === 'error' ? 'alert alert-danger' : 'alert alert-warning'
  var $error = $(yo`<div class="sol ${opt.type} ${classList}"><div class="close"><i class="fas fa-times"></i></div></div>`).prepend($pre)
  $(container).append($error)

  $error.click((ev) => {
    if (opt.errFile && opt.errLine) {
      this._errorClick(opt.errFile, opt.errLine, opt.errCol)
    } else if (opt.click) {
      opt.click(message)
    }
  })

  $error.find('.close').click(function (ev) {
    ev.preventDefault()
    $error.remove()
    return false
  })
}

function parseRegExError (err) {
  return {
    errFile: err[1],
    errLine: parseInt(err[2], 10) - 1,
    errCol: err[4] ? parseInt(err[4], 10) : 0
  }
}

module.exports = Renderer
