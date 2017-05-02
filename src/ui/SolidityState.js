'use strict'
var DropdownPanel = require('./DropdownPanel')
var stateDecoder = require('../solidity/stateDecoder')
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var StorageViewer = require('../storage/storageViewer')
var util = require('../solidity/types/util')
var ethutil = require('ethereumjs-util')
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
}

SolidityState.prototype.render = function () {
  this.view = yo`<div id='soliditystate' >
      <div id='warning'></div>
      ${this.basicPanel.render()}
    </div>`
  return this.view
}

SolidityState.prototype.init = function () {
  var self = this
  this.parent.event.register('indexChanged', this, function (index) {
    var warningDiv = this.view.querySelector('#warning')
    warningDiv.innerHTML = ''
    if (index < 0) {
      warningDiv.innerHTML = 'invalid step index'
      return
    }

    if (self.parent.currentStepIndex !== index) return
    if (!this.solidityProxy.loaded()) {
      warningDiv.innerHTML = 'no source has been specified'
      return
    }

    if (!self.storageResolver) {
      warningDiv.innerHTML = 'storage not ready'
      return
    }

    self.traceManager.getCurrentCalledAddressAt(self.parent.currentStepIndex, (error, address) => {
      if (error) {
        self.basicPanel.update({})
        console.log(error)
      } else {
        self.solidityProxy.extractStateVariablesAt(index, function (error, stateVars) {
          if (error) {
            self.basicPanel.update({})
            console.log(error)
          } else {
            var storageViewer = new StorageViewer({
              stepIndex: self.parent.currentStepIndex,
              tx: self.parent.tx,
              address: address
            }, self.storageResolver, self.traceManager)

            var storageJSON = {}
            storageViewer.storageRange(function (error, result) {
              if (!error) {
                storageJSON = result
                var sha3Preimages = self.traceManager.traceCache.sha3Preimages
                var mappingPreimages = getMappingPreimages(stateVars, storageJSON, sha3Preimages)

                for (var k in stateVars) {
                  var stateVar = stateVars[k]
                  if (stateVar.type.typeName.indexOf('mapping') === 0) {
                    var mapSlot = util.toBN(stateVar.storagelocation.slot).toString(16)
                    mapSlot = ethutil.setLengthLeft('0x' + mapSlot, 32).toString('hex')
                    stateVar.type.setMappingElements(mappingPreimages[mapSlot])
                  }
                }

                stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
                  if (!result.error) {
                    self.basicPanel.update(result)
                  }
                })
              }
            })
          }
        })
      }
    })
  })
}

function getMappingPreimages (stateVars, storage, preimages) {
  // loop over stateVars and get the locations of all the mappings
  // then on each mapping, pass its specific preimage keys

  // first filter out all non-mapping storage slots

  var ignoreSlots = []
  for (var k in stateVars) {
    var stateVar = stateVars[k]
    if (stateVar.type.typeName.indexOf('mapping') !== 0) {
      ignoreSlots.push(stateVar.storagelocation.slot.toString())
    }
  }

  var possibleMappings = []
  for (var hashedLoc in storage) {
    var slotNum = util.toBN(storage[hashedLoc].key).toString(10)
    if (ignoreSlots.indexOf(slotNum) === -1) {
      possibleMappings.push(storage[hashedLoc].key)
    }
  }

  var storageMappings = {}
  for (var pk in possibleMappings) {
    var possMapKey = possibleMappings[pk].replace('0x', '')
    if (preimages[possMapKey]) {
      // got preimage!
      var preimage = preimages[possMapKey].preimage
      // get mapping position (i.e. storage slot), its the last 32 bytes
      var slotByteOffset = preimage.length - 64
      var mappingSlot = preimage.substr(slotByteOffset)
      var mappingKey = preimage.substr(0, slotByteOffset)
      if (!storageMappings[mappingSlot]) {
        storageMappings[mappingSlot] = []
      }
      storageMappings[mappingSlot].push(mappingKey)
    }
  }
  return storageMappings
}

module.exports = SolidityState
