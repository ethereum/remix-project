'use strict'
var DropdownPanel = require('./DropdownPanel')
var traceHelper = require('../helpers/traceHelper')
var stateDecoder = require('../solidity/stateDecoder')
var yo = require('yo-yo')

function SolidityState (_parent, _traceManager, _codeManager) {
  this.parent = _parent
  this.traceManager = _traceManager
  this.codeManager = _codeManager
  this.basicPanel = new DropdownPanel('Solidity State')
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
    if (!this.parent.contractsDetail || !this.parent.sources) {
      self.basicPanel.update({info: 'no source has been specified'})
      return
    }

    self.traceManager.getStorageAt(index, null, function (error, storage) {
      if (error) {
        self.basicPanel.update({ info: error })
      } else {
        self.traceManager.getCurrentCalledAddressAt(index, function (error, address) {
          if (error) {
            self.basicPanel.update({ info: error })
          } else {
            self.codeManager.getCode(address, function (error, code) {
              if (error) {
                self.basicPanel.update({ info: error })
              } else {
                var contractName = contractNameFromCode(self.parent.contractsDetail, code.bytecode, address)
                if (contractName === null) {
                  self.basicPanel.update({ info: 'could not find compiled contract with address ' + address })
                } else {
                  var state = stateDecoder.solidityState(storage, self.parent.sources, contractName)
                  self.basicPanel.update(state)
                }
              }
            })
          }
        })
      }
    })
  })
}

function contractNameFromCode (contracts, code, address) {
  var isCreation = traceHelper.isContractCreation(address)
  var byteProp = isCreation ? 'bytecode' : 'runtimeBytecode'
  for (var k in contracts) {
    if ('0x' + contracts[k][byteProp] === code) {
      return k
    }
  }
  return null
}

module.exports = SolidityState
