'use strict'
var BasicPanel = require('./BasicPanel')
var yo = require('yo-yo')

function CallstackPanel (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new BasicPanel('Call Stack')
  this.init()
}

CallstackPanel.prototype.render = function () {
  return yo`<div id='callstackpanel' >${this.basicPanel.render()}</div>`
}

CallstackPanel.prototype.init = function () {
  var self = this
  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getCallStackAt(index, function (error, callstack) {
      if (error) {
        console.log(error)
        self.basicPanel.data = ''
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.data = self.format(callstack)
      }
      self.basicPanel.update()
    })
  })
}

CallstackPanel.prototype.format = function (callstack) {
  var ret = ''
  for (var key in callstack) {
    ret += callstack[key] + '\n'
  }
  return ret
}

module.exports = CallstackPanel
