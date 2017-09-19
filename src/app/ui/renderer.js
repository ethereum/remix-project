'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var utils = require('../../lib/utils')

var css = yo`<style>
.sol.success,
.sol.error,
.sol.warning {
    word-wrap: break-word;
    cursor: pointer;
    position: relative;
    margin: 0.5em 0 1em 0;
    border-radius: 5px;
    line-height: 20px;
    padding: 8px 15px;
}

.sol.success pre,
.sol.error pre,
.sol.warning pre {
    background-color: transparent;
    margin: 0;
    font-size: 12px;
    border: 0 none;
    padding: 0;
    border-radius: 0;
}

.sol.success .close,
.sol.error .close,
.sol.warning .close {
    font-weight: bold;
    position: absolute;
    color: hsl(0, 0%, 0%); /* black in style-guide.js */
    top: 0;
    right: 0;
    padding: 0.5em;
}

.sol.error {
    background-color: hsla(0, 82%, 82%, 0.1);
    border: .2em dotted hsla(0, 82%, 82%, 1); /* red in style-guide.js */
}

.sol.warning {
    background-color: hsla(59, 56%, 78%, 0.5);
    border: .2em dotted hsla(44, 100%, 50%, 1); /* orange in style-guide.js */
}

.sol.success {
    background-color: hsla(141, 58%, 95%, 1);
    border: .2em dotted hsla(141, 40%, 48%, 1);
}</style>`

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

Renderer.prototype.error = function (message, container, options) {
  if (container === undefined) return
  var self = this
  var opt = options || {}
  if (!opt.type) {
    opt.type = utils.errortype(message)
  }
  var $pre
  if (opt.isHTML) {
    $pre = $(opt.useSpan ? '<span />' : '<pre />').html(message)
  } else {
    $pre = $(opt.useSpan ? '<span />' : '<pre />').text(message)
  }
  var $error = $('<div class="sol ' + opt.type + '"><div class="close"><i class="fa fa-close"></i></div></div>').prepend($pre)
  container.append($error)
  var err = message.match(/^([^:]*):([0-9]*):(([0-9]*):)? /)
  if (err) {
    var errFile = err[1]
    var errLine = parseInt(err[2], 10) - 1
    var errCol = err[4] ? parseInt(err[4], 10) : 0
    if (!opt.noAnnotations) {
      self.appAPI.error(errFile, {
        row: errLine,
        column: errCol,
        text: message,
        type: opt.type
      })
    }
    $error.click(function (ev) {
      options && options.click ? options.click(errFile, errLine, errCol) : self.appAPI.errorClick(errFile, errLine, errCol)
    })
  } else if (options && options.click) {
    $error.click(function (ev) {
      options.click(message)
    })
  }

  $error.find('.close').click(function (ev) {
    ev.preventDefault()
    $error.remove()
    return false
  })
}

module.exports = Renderer
