'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function StoragePanel (_parent, _traceManager, _storageResolver) {
  this.parent = _parent
  this.storageResolver = _storageResolver
  this.traceManager = _traceManager
  this.basicPanel = new DropdownPanel('Storage', {json: true})
  this.init()
  this.disabled = false
}

StoragePanel.prototype.render = function () {
  return yo`<div id='storagepanel' >${this.basicPanel.render()}</div>`
}

StoragePanel.prototype.init = function () {
  var self = this
  this.parent.event.register('indexChanged', this, function (index) {
    if (self.disabled) return
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.storageResolver.storageRange((error, storage) => {
      if (error) {
        console.log(error)
        self.basicPanel.update({})
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.update(storage)
      }
    })
  })
}

module.exports = StoragePanel
