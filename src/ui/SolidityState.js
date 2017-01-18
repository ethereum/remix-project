'use strict'
var DropdownPanel = require('./DropdownPanel')
var stateDecoder = require('../solidity/stateDecoder')
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var yo = require('yo-yo')

function SolidityState (_parent, _traceManager, _codeManager, _solidityProxy) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.codeManager = _codeManager
  this.solidityProxy = _solidityProxy
  this.basicPanel = new DropdownPanel('Solidity State', {
    json: true,
    formatData: solidityTypeFormatter.formatData,
    extractData: solidityTypeFormatter.extractData
  })
  this.init()
}

SolidityState.prototype.render = function () {
  return yo`<div id='soliditystate' >${this.basicPanel.render()}</div>`
}

SolidityState.prototype.init = function () {
  var self = this
  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) {
      self.basicPanel.update({info: 'invalid step index'})
      return
    }
    if (self.parent.currentStepIndex !== index) return
    if (!this.solidityProxy.loaded()) {
      self.basicPanel.update({info: 'no source has been specified'})
      return
    }

    self.traceManager.getStorageAt(index, this.parent.tx, function (error, storage) {
      if (error) {
        self.basicPanel.update({ info: error })
      } else {
        self.solidityProxy.extractStateVariablesAt(index, function (error, stateVars) {
          if (error) {
            self.basicPanel.update({ info: error })
          } else {
            self.basicPanel.update(stateDecoder.decodeState(stateVars, storage))
          }
        })
      }
    })
  })
}

module.exports = SolidityState
