'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function StackPanel () {
  this.basicPanel = new DropdownPanel('Stack', {json: true, displayContentOnly: false})
}

StackPanel.prototype.update = function (calldata) {
  this.basicPanel.update(calldata)
}

StackPanel.prototype.render = function () {
  return yo`<div id='stackpanel' >${this.basicPanel.render()}</div>`
}

module.exports = StackPanel
