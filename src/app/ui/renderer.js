'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var utils = require('../../lib/utils')

// -------------- styling ----------------------
// var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

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
    overflow-y: hidden;
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
    background-color: ${styles.rightPanel.message_Error_BackgroundColor};
    border: .2em dotted ${styles.rightPanel.message_Error_BorderColor};
    color: ${styles.rightPanel.message_Error_Color};
}

.sol.warning {
  background-color: ${styles.rightPanel.message_Warning_BackgroundColor};
  border: .2em dotted ${styles.rightPanel.message_Warning_BorderColor};
  color: ${styles.rightPanel.message_Warning_Color};
}

.sol.success {
  background-color: ${styles.rightPanel.message_Success_BackgroundColor};
  border: .2em dotted ${styles.rightPanel.message_Success_BorderColor};
  color: ${styles.rightPanel.message_Success_Color};
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
