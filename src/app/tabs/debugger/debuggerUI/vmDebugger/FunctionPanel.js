'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function FunctionPanel () {
  this.basicPanel = new DropdownPanel('Function', {json: true, displayContentOnly: false})
}

FunctionPanel.prototype.update = function (calldata) {
  this.basicPanel.update(calldata)
}

FunctionPanel.prototype.render = function () {
  return yo`<div id="FunctionPanel">${this.basicPanel.render()}</div>`
}

module.exports = FunctionPanel
