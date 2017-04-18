'use strict'
var DropdownPanel = require('./DropdownPanel')
var localDecoder = require('../solidity/localDecoder')
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var StorageViewer = require('../storage/storageViewer')
var yo = require('yo-yo')

class SolidityLocals {

  constructor (_parent, _traceManager, _internalTreeCall) {
    this.parent = _parent
    this.internalTreeCall = _internalTreeCall
    this.storageResolver = null
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
      if (!this.storageResolver) {
        warningDiv.innerHTML = 'storage not ready'
        return
      }
      this.traceManager.waterfall([
        this.traceManager.getStackAt,
        this.traceManager.getMemoryAt,
        this.traceManager.getCurrentCalledAddressAt],
        this.parent.currentStepIndex,
        (error, result) => {
          if (!error) {
            var stack = result[0].value
            var memory = result[1].value
            try {
              var storageViewer = new StorageViewer({
                stepIndex: this.parent.currentStepIndex,
                tx: this.parent.tx,
                address: result[2].value
              }, this.storageResolver, this.traceManager)
              localDecoder.solidityLocals(this.parent.currentStepIndex, this.internalTreeCall, stack, memory, storageViewer, sourceLocation).then((locals) => {
                if (!locals.error) {
                  this.basicPanel.update(locals)
                }
              })
            } catch (e) {
              warningDiv.innerHTML = e.message
            }
          } else {
            console.log(error)
          }
        })
    })
  }
}

module.exports = SolidityLocals
