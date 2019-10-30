'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function MemoryPanel () {
  this.basicPanel = new DropdownPanel('Memory', {
    json: true,
    css: {
      'font-family': 'monospace'
    }})
}

MemoryPanel.prototype.update = function (calldata) {
  this.basicPanel.update(calldata)
}

MemoryPanel.prototype.render = function () {
  return yo`<div id="memorypanel" class="text-monospace small">${this.basicPanel.render()}</div>`
}

module.exports = MemoryPanel
