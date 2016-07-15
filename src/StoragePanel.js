'use strict'
var BasicPanel = require('./BasicPanel')
var yo = require('yo-yo')

function StoragePanel (_parent, _traceManager, _address) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.basicPanel = new BasicPanel('Storage Changes')
  this.address = _address
  this.init()
  this.disabled = false
}

StoragePanel.prototype.render = function () {
  return yo`<div id='storagepanel' >${this.basicPanel.render()}</div>`
}

StoragePanel.prototype.init = function () {
  var self = this
  this.parent.register('indexChanged', this, function (index) {
    if (self.disabled) return
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getStorageAt(index, self.parent.tx, function (error, storage) {
      if (error) {
        console.log(error)
        self.basicPanel.data = self.formatStorage(storage)
      } else if (self.parent.currentStepIndex === index) {
        self.basicPanel.data = self.formatStorage(storage)
      }
      self.basicPanel.update()
    }, self.address)
  })
}

StoragePanel.prototype.formatStorage = function (storage) {
  var ret = ''
  for (var key in storage) {
    ret += key + '  ' + storage[key] + '\n'
  }
  return ret
}

module.exports = StoragePanel
