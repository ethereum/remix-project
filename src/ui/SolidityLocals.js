'use strict'
var DropdownPanel = require('./DropdownPanel')
var localDecoder = require('../solidity/localDecoder')
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var yo = require('yo-yo')

class SolidityLocals {

  constructor (_parent, _traceManager, _internalTreeCall, _storageResolver) {
    this.parent = _parent
    this.internalTreeCall = _internalTreeCall
    this.storageResolver = _storageResolver
    this.traceManager = _traceManager
    this.basicPanel = new DropdownPanel('Solidity Locals', {
      json: true,
      formatSelf: solidityTypeFormatter.formatSelf,
      extractData: solidityTypeFormatter.extractData
    })
    this.init()
    this.view
  }

  render () {
    this.view = yo`<div id='soliditylocals' >
    <div id='warning'></div>
    ${this.basicPanel.render()}
    </div>`
    return this.view
  }

  init () {
    this.parent.event.register('sourceLocationChanged', this, (sourceLocation) => {
      var warningDiv = this.view.querySelector('#warning')
      warningDiv.innerHTML = ''
      this.traceManager.waterfall([
        this.traceManager.getStackAt,
        this.traceManager.getMemoryAt],
        this.parent.currentStepIndex,
        (error, result) => {
          if (!error) {
            var stack = result[0].value
            var memory = result[1].value
            try {
              var locals = localDecoder.solidityLocals(this.parent.currentStepIndex, this.internalTreeCall, stack, memory, this.storageResolver, sourceLocation)
              this.basicPanel.update(locals)
            } catch (e) {
              warningDiv.innerHTML = e.message
            }
          }
        })
    })
  }
}

module.exports = SolidityLocals
