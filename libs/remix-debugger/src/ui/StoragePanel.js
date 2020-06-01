'use strict'
var DropdownPanel = require('./DropdownPanel')
var remixCore = require('remix-core')
var StorageViewer = remixCore.storage.StorageViewer
var yo = require('yo-yo')

function StoragePanel (_parent, _traceManager) {
  this.parent = _parent
  this.storageResolver = null
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
    if (!self.storageResolver) return

    this.traceManager.getCurrentCalledAddressAt(index, (error, address) => {
      if (!error) {
        var storageViewer = new StorageViewer({
          stepIndex: self.parent.currentStepIndex,
          tx: self.parent.tx,
          address: address
        }, self.storageResolver, self.traceManager)

        storageViewer.storageRange((error, storage) => {
          if (error) {
            console.log(error)
            self.basicPanel.update({})
          } else if (self.parent.currentStepIndex === index) {
            var header = storageViewer.isComplete(address) ? 'completely loaded' : 'partially loaded...'
            self.basicPanel.update(storage, header)
          }
        })
      }
    })
  })
}

module.exports = StoragePanel
