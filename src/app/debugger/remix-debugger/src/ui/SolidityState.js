'use strict'
var DropdownPanel = require('./DropdownPanel')
var remixDebug = require('remix-debug')
var stateDecoder = remixDebug.SolidityDecoder.stateDecoder
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var StorageViewer = remixDebug.storage.StorageViewer
var yo = require('yo-yo')

function SolidityState (_parent, _traceManager, _codeManager, _solidityProxy) {
  this.storageResolver = null
  this.parent = _parent
  this.traceManager = _traceManager
  this.codeManager = _codeManager
  this.solidityProxy = _solidityProxy
  this.basicPanel = new DropdownPanel('Solidity State', {
    json: true,
    formatSelf: solidityTypeFormatter.formatSelf,
    extractData: solidityTypeFormatter.extractData
  })
  this.init()
  this.view
  this.stateVariablesByAddresses = {}
  _parent.event.register('traceUnloaded', () => { this.stateVariablesByAddresses = {} })
  _parent.event.register('newTraceLoaded', () => { this.stateVariablesByAddresses = {} })
}

SolidityState.prototype.render = function () {
  if (!this.view) {
    this.view = yo`<div id='soliditystate' >
      ${this.basicPanel.render()}
    </div>`
  }
  return this.view
}

SolidityState.prototype.init = function () {
  var self = this
  var decodeTimeout = null
  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) {
      self.basicPanel.setMessage('invalid step index')
      return
    }

    if (self.parent.currentStepIndex !== index) return
    if (!self.solidityProxy.loaded()) {
      self.basicPanel.setMessage('no source has been specified')
      return
    }

    if (!self.storageResolver) {
      return
    }
    if (decodeTimeout) {
      window.clearTimeout(decodeTimeout)
    }
    self.basicPanel.setUpdating()
    decodeTimeout = setTimeout(() => {
      decode(self, index)
    }, 500)
  })
}

function decode (self, index) {
  self.traceManager.getCurrentCalledAddressAt(self.parent.currentStepIndex, (error, address) => {
    if (error) {
      self.basicPanel.update({})
      console.log(error)
    } else {
      if (self.stateVariablesByAddresses[address]) {
        extractStateVariables(self, self.stateVariablesByAddresses[address], address)
      } else {
        self.solidityProxy.extractStateVariablesAt(index, function (error, stateVars) {
          if (error) {
            self.basicPanel.update({})
            console.log(error)
          } else {
            self.stateVariablesByAddresses[address] = stateVars
            extractStateVariables(self, stateVars, address)
          }
        })
      }
    }
  })
}

function extractStateVariables (self, stateVars, address) {
  var storageViewer = new StorageViewer({
    stepIndex: self.parent.currentStepIndex,
    tx: self.parent.tx,
    address: address
  }, self.storageResolver, self.traceManager)
  stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
    self.basicPanel.setMessage('')
    if (!result.error) {
      self.basicPanel.update(result)
    } else {
      self.basicPanel.setMessage(result.error)
    }
  })
}

module.exports = SolidityState
