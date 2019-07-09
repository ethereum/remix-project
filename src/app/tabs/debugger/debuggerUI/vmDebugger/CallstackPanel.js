'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function CallstackPanel () {
  this.basicPanel = new DropdownPanel('Call Stack', {json: true})
}

CallstackPanel.prototype.update = function (calldata) {
  this.basicPanel.update(calldata)
}

CallstackPanel.prototype.render = function () {
  return yo`<div id='callstackpanel' >${this.basicPanel.render()}</div>`
}

module.exports = CallstackPanel

