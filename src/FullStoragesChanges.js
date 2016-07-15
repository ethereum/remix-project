'use strict'
var BasicPanel = require('./BasicPanel')
var yo = require('yo-yo')

function FullStoragesChanges (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.addresses = []
  this.view
  this.traceLength
  this.basicPanel = new BasicPanel('Full Storages Changes', '1205px', '100px')
  this.init()
}

FullStoragesChanges.prototype.render = function () {
  var view = yo`<div id='fullstorageschangespanel' >${this.basicPanel.render()}</div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

FullStoragesChanges.prototype.hide = function () {
  this.view.style.display = 'none'
}

FullStoragesChanges.prototype.show = function () {
  this.view.style.display = 'block'
}

FullStoragesChanges.prototype.init = function () {
  var self = this
  this.parent.register('newTraceLoaded', this, function (length) {
    self.panels = []
    self.traceManager.getAddresses(function (error, addresses) {
      if (!error) {
        self.addresses = addresses
        self.basicPanel.data = ''
        yo.update(self.view, self.render())
        self.hide()
      }
    })

    self.traceManager.getLength(function (error, length) {
      if (!error) {
        self.traceLength = length
      }
    })
  })

  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    if (index === self.traceLength - 1) {
      var storageJSON = {}
      for (var k in self.addresses) {
        self.traceManager.getStorageAt(index, null, function (error, result) {
          if (!error) {
            storageJSON[self.addresses[k]] = result
            self.basicPanel.data = JSON.stringify(storageJSON, null, '\t')
            yo.update(self.view, self.render())
            self.show()
          }
        }, self.addresses[k])
      }
    } else {
      self.hide()
    }
  })
}

module.exports = FullStoragesChanges
