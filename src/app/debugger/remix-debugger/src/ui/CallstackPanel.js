'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function CallstackPanel (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new DropdownPanel('Call Stack', {json: true})
  this.init()
}

CallstackPanel.prototype.render = function () {
  return yo`<div id='callstackpanel' >${this.basicPanel.render()}</div>`
}

CallstackPanel.prototype.init = function () {
  var self = this
  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getCallStackAt(index, function (error, callstack) {
      if (error) {
        console.log(error)
        self.basicPanel.update({})
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.update(callstack)
      }
    })
  })
}

module.exports = CallstackPanel
