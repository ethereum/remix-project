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
function Renderer (service) {
  const self = this
  self.service = service
  self._components = {}
  self._components.registry = globlalRegistry
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
  if (file === self._deps.config.get('currentFile')) {
    self.service.call('editor', 'addAnnotation', error, file)
  }
}

Renderer.prototype._errorClick = function (errFile, errLine, errCol) {
  const self = this
  const editor = self._components.registry.get('editor').api
  if (errFile !== self._deps.config.get('currentFile')) {
    // TODO: refactor with this._components.contextView.jumpTo
    var provider = self._deps.fileManager.fileProviderOf(errFile)
    if (provider) {
      provider.exists(errFile).then(exist => {
        self._deps.fileManager.open(errFile)
        editor.gotoLine(errLine, errCol)
      }).catch(error => {
        if (error) return console.log(error)
      })
    }
  } else {
    editor.gotoLine(errLine, errCol)
  }
}

function getPositionDetails (msg) {
  const result = {}

  // To handle some compiler warning without location like SPDX license warning etc
  if (!msg.includes(':')) return { errLine: -1, errCol: -1, errFile: msg }

  // extract line / column
  let position = msg.match(/^(.*?):([0-9]*?):([0-9]*?)?/)
  result.errLine = position ? parseInt(position[2]) - 1 : -1
  result.errCol = position ? parseInt(position[3]) : -1

  // extract file
  position = msg.match(/^(https:.*?|http:.*?|.*?):/)
  result.errFile = position ? position[1] : ''
  return result
}

/**
 * format msg like error or warning,
 *
 * @param {String or DOMElement} message
 * @param {DOMElement} container
 * @param {Object} options {
 *  useSpan,
 *  noAnnotations,
 *  click:(Function),
 *  type:(
 *    warning,
 *    error
 *  ),
 *  errFile,
 *  errLine,
 *  errCol
 * }
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

  // ^ e.g:
  // browser/gm.sol: Warning: Source file does not specify required compiler version! Consider adding "pragma solidity ^0.6.12
  // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/introspection/IERC1820Registry.sol:3:1: ParserError: Source file requires different compiler version (current compiler is 0.7.4+commit.3f05b770.Emscripten.clang) - note that nightly builds are considered to be strictly less than the released version

  let position = getPositionDetails(text)

  // For compiler version 0.8.0 and upcoming versions, errors and warning will be reported in a different way
  // Above method regex will return type of error as 'errFile'
  // Comparison of 'errFile' with passed error type will ensure the reporter type
  if (!position.errFile || (opt.errorType && opt.errorType === position.errFile)) {
    // Updated error reported includes '-->' before file details
    const errorDetails = text.split('-->')
    // errorDetails[1] will have file details
    if (errorDetails.length > 1) position = getPositionDetails(errorDetails[1])
  }

  opt.errLine = position.errLine
  opt.errCol = position.errCol
  opt.errFile = position.errFile.trim()

  if (!opt.noAnnotations && opt.errFile) {
    this._error(opt.errFile, {
      row: opt.errLine,
      column: opt.errCol,
      text: text,
      type: opt.type
    })
  }

  var $pre = $(opt.useSpan ? yo`<span></span>` : yo`<pre></pre>`).html(message)

  const classList = opt.type === 'error' ? 'alert alert-danger' : 'alert alert-warning'
  var $error = $(yo`<div class="sol ${opt.type} ${classList}" data-id="${opt.errFile}"><div class="close" data-id="renderer"><i class="fas fa-times"></i></div></div>`).prepend($pre)
  $(container).append($error)

  $error.click((ev) => {
    if (opt.click) {
      opt.click(message)
    } else if (opt.errFile !== undefined && opt.errLine !== undefined && opt.errCol !== undefined) {
      this._errorClick(opt.errFile, opt.errLine, opt.errCol)
    }
  })

  $error.find('.close').click(function (ev) {
    ev.preventDefault()
    $error.remove()
    return false
  })
}

module.exports = Renderer
