'use strict'
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var DropdownPanel = require('./DropdownPanel')
var remixDebug = require('remix-debug')
var localDecoder = remixDebug.SolidityDecoder.localDecoder
var solidityTypeFormatter = require('./utils/SolidityTypeFormatter')
var StorageViewer = remixDebug.storage.StorageViewer
var yo = require('yo-yo')

class DebuggerSolidityLocals {

  constructor (_parent, _traceManager, _internalTreeCall) {
    this.event = new EventManager()
    this.parent = _parent
    this.internalTreeCall = _internalTreeCall
    this.storageResolver = null
    this.traceManager = _traceManager
  }

  init () {
    const self = this
    var decodeTimeout = null
    this.parent.event.register('sourceLocationChanged', this, (sourceLocation) => {
      if (!this.storageResolver) {
        return self.event.trigger('solidityLocalsMessage', ['storage not ready'])
      }
      if (decodeTimeout) {
        window.clearTimeout(decodeTimeout)
      }
      self.event.trigger('solidityLocalsUpdating')
      decodeTimeout = setTimeout(function () {
        self.decode(sourceLocation)
      }, 500)
    })
  }

  decode (sourceLocation) {
    const self = this
    self.event.trigger('solidityLocalsMessage', [''])
    self.traceManager.waterfall([
      self.traceManager.getStackAt,
      self.traceManager.getMemoryAt,
      self.traceManager.getCurrentCalledAddressAt],
      self.parent.currentStepIndex,
      (error, result) => {
        if (!error) {
          var stack = result[0].value
          var memory = result[1].value
          try {
            var storageViewer = new StorageViewer({ stepIndex: self.parent.currentStepIndex, tx: self.parent.tx, address: result[2].value }, self.storageResolver, self.traceManager)
            localDecoder.solidityLocals(self.parent.currentStepIndex, self.internalTreeCall, stack, memory, storageViewer, sourceLocation).then((locals) => {
              if (!locals.error) {
                self.event.trigger('solidityLocals', [locals])
              }
              if (!Object.keys(locals).length) {
                self.event.trigger('solidityLocalsMessage', ['no locals'])
              }
            })
          } catch (e) {
            self.event.trigger('solidityLocalsMessage', [e.message])
          }
        } else {
          console.log(error)
        }
      })
  }

}

class SolidityLocals {

  constructor (_parent, _traceManager, _internalTreeCall) {
    const self = this
    this.event = new EventManager()
    this.basicPanel = new DropdownPanel('Solidity Locals', {
      json: true,
      formatSelf: solidityTypeFormatter.formatSelf,
      extractData: solidityTypeFormatter.extractData
    })

    this.debuggerSolidityLocals = new DebuggerSolidityLocals(_parent, _traceManager, _internalTreeCall)
    this.parent = this.debuggerSolidityLocals.parent
    this.internalTreeCall = this.debuggerSolidityLocals.internalTreeCall
    this.storageResolver = this.debuggerSolidityLocals.storageResolver
    this.traceManager = this.debuggerSolidityLocals.traceManager

    this.debuggerSolidityLocals.event.register('solidityLocals', this, function (state) {
      self.update(state)
    })
    this.debuggerSolidityLocals.event.register('solidityLocalsMessage', this, function (message) {
      self.setMessage(message)
    })
    this.debuggerSolidityLocals.event.register('solidityLocalsUpdating', this, function () {
      self.setUpdating()
    })
    this.debuggerSolidityLocals.init()

    this.view
  }

  update (data) {
    this.basicPanel.update(data)
  }

  setMessage (message) {
    this.basicPanel.setMessage(message)
  }

  setUpdating () {
    this.basicPanel.setUpdating()
  }

  render () {
    this.view = yo`<div id='soliditylocals'>${this.basicPanel.render()}</div>`
    return this.view
  }
}

module.exports = SolidityLocals

