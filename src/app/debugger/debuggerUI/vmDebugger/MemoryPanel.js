'use strict'
var DropdownPanel = require('./DropdownPanel')
var remixLib = require('remix-lib')
var ui = remixLib.helpers.ui
var yo = require('yo-yo')

function MemoryPanel (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new DropdownPanel('Memory', {
    json: true,
    css: {
      'font-family': 'monospace'
    }})
  this.init()
}

MemoryPanel.prototype.render = function () {
  return yo`<div id='memorypanel' >${this.basicPanel.render()}</div>`
}

MemoryPanel.prototype.init = function () {
  var self = this
  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getMemoryAt(index, function (error, memory) {
      if (error) {
        console.log(error)
        self.basicPanel.update({})
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.update(ui.formatMemory(memory, 16))
      }
    })
  })
}

module.exports = MemoryPanel
