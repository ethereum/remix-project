'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function CalldataPanel (_parentUI, _traceManager) {
  this._parentUI = _parentUI
  this.traceManager = _traceManager
  this.basicPanel = new DropdownPanel('Call Data', {json: true})
  this.init()
}

CalldataPanel.prototype.render = function () {
  return yo`<div id='calldatapanel' >${this.basicPanel.render()}</div>`
}

CalldataPanel.prototype.init = function () {
  var self = this
  this._parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self._parentUI.currentStepIndex !== index) return

    self.traceManager.getCallDataAt(index, function (error, calldata) {
      if (error) {
        self.basicPanel.update({})
        console.log(error)
      } else if (self._parentUI.currentStepIndex === index) {
        self.basicPanel.update(calldata)
      }
    })
  })
}

module.exports = CalldataPanel
