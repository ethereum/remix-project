'use strict'
var DropdownPanel = require('./DropdownPanel')
var stateDecoder = require('../solidity/stateDecoder')
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var yo = require('yo-yo')

function SolidityState (_parent, _traceManager, _codeManager, _solidityProxy, _storageResolver) {
  this.storageResolver = _storageResolver
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

    self.traceManager.getCurrentCalledAddressAt(self.parent.currentStepIndex, (error, result) => {
      if (error) {
        self.basicPanel.update({})
        console.log(error)
      } else {
        self.solidityProxy.extractStateVariablesAt(index, function (error, stateVars) {
          if (error) {
            self.basicPanel.update({})
            console.log(error)
          } else {
            stateDecoder.decodeState(stateVars, self.storageResolver).then((result) => {
              if (!result.error) {
                self.basicPanel.update(result)
              }
            })
          }
        })
      }
    })
  })
}

module.exports = SolidityState
