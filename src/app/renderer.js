'use strict'

var $ = require('jquery')

var utils = require('./utils')

/**
 * After refactor, the renderer is only used to render error/warning
 * TODO: This don't need to be an object anymore. Simplify and just export the renderError function.
 *
 */
function Renderer (appAPI) {
  this.appAPI = appAPI
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
      self.appAPI.errorClick(errFile, errLine, errCol)
    })
  }
  $error.find('.close').click(function (ev) {
    ev.preventDefault()
    $error.remove()
    return false
  })
}

module.exports = Renderer
