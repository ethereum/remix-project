'use strict'
var StoragePanel = require('./StoragePanel')
var yo = require('yo-yo')

function FullStoragesChanges (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.init()
  this.panels = {}  
}

FullStoragesChanges.prototype.render = function () {
  return yo`<div><div>Full Storages Changes</div><div>${this.view}</div></div>`
}

FullStoragesChanges.prototype.init = function () {
  var self = this
  this.parent.register('newTraceLoaded', this, function (length) {
    self.panels = {}
    self.traceManager.getAddresses(function (addresses) {
      for (var k in addresses) {
        self.panels[addresses] = new StoragePanel(self.traceManager, self.traceManager, k)
        self.panels[addresses].disable = true
      }
    })
  })

  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    self.traceManager.getLength(function (error, length) {
      if (!error) {
        for (var k in self.panels) {
          self.panels[k].disabled = index !== length - 1
        }
        if (index !== length - 1) {
          self.view = ''
          if (self.view) {
            yo.update(self.view, self.render())
          }
        }
      }
    })
  })
}

FullStoragesChanges.prototype.renderAssemblyItems = function () {
  if (this.panels) {
    this.codeView = this.panels.map(function (item, i) {
      return yo`<div>${item.render()}</div>`
    })
    return this.codeView
  }
}

module.exports = FullStoragesChanges
