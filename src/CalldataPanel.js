'use strict'
var BasicPanel = require('./BasicPanel')
var yo = require('yo-yo')

function CalldataPanel (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new BasicPanel('Call Data')
  this.init()
}

CalldataPanel.prototype.render = function () {
  return yo`<div id='calldatapanel' >${this.basicPanel.render()}</div>`
}

CalldataPanel.prototype.init = function () {
  var self = this
  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getCallDataAt(index, function (error, calldata) {
      if (error) {
        self.basicPanel.data = ''
        console.log(error)
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.data = self.format(calldata)
      }
      self.basicPanel.update()
    })
  })
}

CalldataPanel.prototype.format = function (calldata) {
  var ret = ''
  for (var key in calldata) {
    ret += calldata[key] + '\n'
  }
  return ret
}

module.exports = CalldataPanel
