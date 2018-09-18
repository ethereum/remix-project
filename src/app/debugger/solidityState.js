var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var remixDebug = require('remix-debug')
var stateDecoder = remixDebug.SolidityDecoder.stateDecoder
var StorageViewer = remixDebug.storage.StorageViewer

class DebuggerSolidityState {

  constructor (_parent, _traceManager, _codeManager, _solidityProxy) {
    this.event = new EventManager()
    this.storageResolver = null
    this.parent = _parent
    this.traceManager = _traceManager
    this.codeManager = _codeManager
    this.solidityProxy = _solidityProxy
    this.stateVariablesByAddresses = {}
    _parent.event.register('traceUnloaded', () => { this.stateVariablesByAddresses = {} })
    _parent.event.register('newTraceLoaded', () => { this.stateVariablesByAddresses = {} })
  }

  init () {
    var self = this
    var decodeTimeout = null
    this.parent.event.register('indexChanged', this, function (index) {
      if (index < 0) {
        return self.event.trigger('solidityStateMessage', ['invalid step index'])
      }

      if (self.parent.currentStepIndex !== index) return
      if (!self.solidityProxy.loaded()) {
        return self.event.trigger('solidityStateMessage', ['invalid step index'])
      }

      if (!self.storageResolver) {
        return
      }
      if (decodeTimeout) {
        window.clearTimeout(decodeTimeout)
      }
      self.event.trigger('solidityStateUpdating')
      decodeTimeout = setTimeout(function () {
        self.decode(index)
      }, 500)
    })
  }

  decode (index) {
    const self = this
    self.traceManager.getCurrentCalledAddressAt(self.parent.currentStepIndex, function (error, address) {
      if (error) {
        return self.event.trigger('solidityState', [{}])
      }
      if (self.stateVariablesByAddresses[address]) {
        return self.extractStateVariables(self.stateVariablesByAddresses[address], address)
      }
      self.solidityProxy.extractStateVariablesAt(index, function (error, stateVars) {
        if (error) {
          return self.event.trigger('solidityState', [{}])
        }
        self.stateVariablesByAddresses[address] = stateVars
        self.extractStateVariables(stateVars, address)
      })
    })
  }

  extractStateVariables (stateVars, address) {
    const self = this
    var storageViewer = new StorageViewer({ stepIndex: self.parent.currentStepIndex, tx: self.parent.tx, address: address }, self.storageResolver, self.traceManager)
    stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
      self.event.trigger('solidityStateMessage', [''])
      if (result.error) {
        return self.event.trigger('solidityStateMessage', [result.error])
      }
      self.event.trigger('solidityState', [result])
    })
  }

}

module.exports = DebuggerSolidityState
