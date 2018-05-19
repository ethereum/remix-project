'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var css = require('./styles/renderer-styles')

/**
 * After refactor, the renderer is only used to render error/warning
 * TODO: This don't need to be an object anymore. Simplify and just export the renderError function.
 *
 */
function Renderer (appAPI) {
  this.appAPI = appAPI
  if (document && document.head) {
    document.head.appendChild(css)
  }
}

/**
 * format msg like error or warning,
 *
 * @param {String or DOMElement} message
 * @param {DOMElement} container
 * @param {Object} options {useSpan, noAnnotations, click:(Function), type:(warning, error), errFile, errLine, errCol}
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
    this.appAPI.error(errLocation.errFile, {
      row: errLocation.errLine,
      column: errLocation.errCol,
      text: text,
      type: opt.type
    })
  }

  var $pre = $(opt.useSpan ? yo`<span />` : yo`<pre />`).html(message)

  var $error = $(yo`<div class="sol ${opt.type}"><div class="close"><i class="fa fa-close"></i></div></div>`).prepend($pre)
  $(container).append($error)

  $error.click((ev) => {
    if (opt.errFile && opt.errLine) {
      this.appAPI.errorClick(opt.errFile, opt.errLine, opt.errCol)
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
