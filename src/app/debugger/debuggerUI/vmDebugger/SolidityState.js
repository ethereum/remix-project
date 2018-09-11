var DropdownPanel = require('./DropdownPanel')
var remixDebug = require('remix-debug')
var stateDecoder = remixDebug.SolidityDecoder.stateDecoder
var solidityTypeFormatter = require('./utils/SolidityTypeFormatter')
var StorageViewer = remixDebug.storage.StorageViewer
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

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
        self.setMessage('invalid step index')
        return
      }

      if (self.parent.currentStepIndex !== index) return
      if (!self.solidityProxy.loaded()) {
        // return self.setMessage('no source has been specified')
        return self.event.trigger('solidityStateMessage', ['invalid step index'])
      }

      if (!self.storageResolver) {
        return
      }
      if (decodeTimeout) {
        window.clearTimeout(decodeTimeout)
      }
      // self.setUpdating()
      self.event.trigger('solidityStateUpdating')
      decodeTimeout = setTimeout(function () {
        //self.decode.apply(self, index)
        self.decode(index)
      }, 500)
    })
  }

  decode (index) {
    const self = this
    self.traceManager.getCurrentCalledAddressAt(self.parent.currentStepIndex, function (error, address) {
      if (error) {
        // return self.update({})
        return self.event.trigger('solidityState', [{}])
      }
      if (self.stateVariablesByAddresses[address]) {
        return self.extractStateVariables(self.stateVariablesByAddresses[address], address)
      }
      self.solidityProxy.extractStateVariablesAt(index, function (error, stateVars) {
        if (error) {
          // return self.update({})
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
      // self.setMessage('')
      self.event.trigger('solidityStateMessage', [''])
      if (result.error) {
        // return self.setMessage(result.error)
        return self.event.trigger('solidityStateMessage', [result.error])
      }
      // self.update(result)
      self.event.trigger('solidityState', [result])
    })
  }

}

function SolidityState (_parent, _traceManager, _codeManager, _solidityProxy) {
  const self = this
  this.basicPanel = new DropdownPanel('Solidity State', {
    json: true,
    // TODO: used by TreeView ui
    formatSelf: solidityTypeFormatter.formatSelf,
    extractData: solidityTypeFormatter.extractData
  })

  this.debuggerSolidityState = new DebuggerSolidityState(_parent, _traceManager, _codeManager, _solidityProxy)
  this.debuggerSolidityState.init()
  this.debuggerSolidityState.event.register('solidityState', this, function (state) {
    self.update(state)
  })
  this.debuggerSolidityState.event.register('solidityStateMessage', this, function (message) {
    self.setMessage(message)
  })
  this.debuggerSolidityState.event.register('solidityStateUpdating', this, function () {
    self.setUpdating()
  })
  this.storageResolver = this.debuggerSolidityState.storageResolver
  this.parent = this.debuggerSolidityState.parent
  this.traceManager = this.debuggerSolidityState.traceManager
  this.codeManager = this.debuggerSolidityState.codeManager
  this.solidityProxy = this.debuggerSolidityState.solidityProxy

  this.view
}

SolidityState.prototype.update = function (data) {
  this.basicPanel.update(data)
}

SolidityState.prototype.setMessage = function (message) {
  this.basicPanel.setMessage(message)
}

SolidityState.prototype.setUpdating = function () {
  this.basicPanel.setUpdating()
}

SolidityState.prototype.render = function () {
  if (this.view) return
  this.view = yo`<div id='soliditystate' >
      ${this.basicPanel.render()}
    </div>`
  return this.view
}

module.exports = SolidityState
