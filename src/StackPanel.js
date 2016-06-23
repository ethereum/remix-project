'use strict'
var BasicPanel = require('./BasicPanel')
var yo = require('yo-yo')

function StackPanel (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new BasicPanel('Stack')
  this.init()
}

StackPanel.prototype.render = function () {
  return (
  yo`${this.basicPanel.render()}`
  )
}

StackPanel.prototype.init = function () {
  var self = this
  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getStackAt(index, function (error, stack) {
      if (error) {
        console.log(error)
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.data = self.format(stack)
        self.basicPanel.update()
      }
    })
  })
}

StackPanel.prototype.format = function (stack) {
  var ret = ''
  for (var key in stack) {
    ret += stack[key] + '\n'
  }
  return ret
}

module.exports = StackPanel
