'use strict'
var DropdownPanel = require('./DropdownPanel')
var remixLib = require('remix-lib')
var ui = remixLib.helpers.ui
var yo = require('yo-yo')

function StackPanel (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new DropdownPanel('Stack', {json: true})
  this.init()
}

StackPanel.prototype.render = function () {
  return yo`<div id='stackpanel' >${this.basicPanel.render()}</div>`
}

StackPanel.prototype.init = function () {
  var self = this
  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getStackAt(index, function (error, stack) {
      if (error) {
        self.basicPanel.update({})
        console.log(error)
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.update(self.format(stack))
      }
    })
  })
}

StackPanel.prototype.format = function (stack) {
  var ret = []
  stack.map(function (item, i) {
    var hex = ui.normalizeHex(item)
    ret.push(hex)
  })
  return ret
}

module.exports = StackPanel
