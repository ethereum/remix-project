'use strict'
var DropdownPanel = require('./DropdownPanel')
var remixDebug = require('remix-debug')
var localDecoder = remixDebug.SolidityDecoder.localDecoder
var solidityTypeFormatter = require('./SolidityTypeFormatter')
var StorageViewer = remixDebug.storage.StorageViewer
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
    ${this.basicPanel.render()}
    </div>`
    return this.view
  }

  init () {
    var decodeTimeout = null
    this.parent.event.register('sourceLocationChanged', this, (sourceLocation) => {
      if (!this.storageResolver) {
        this.basicPanel.setMessage('storage not ready')
        return
      }
      if (decodeTimeout) {
        window.clearTimeout(decodeTimeout)
      }
      this.basicPanel.setUpdating()
      decodeTimeout = setTimeout(() => {
        decode(this, sourceLocation)
      }, 500)
    })
  }
}

function decode (self, sourceLocation) {
  self.basicPanel.setMessage('')
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
          var storageViewer = new StorageViewer({
            stepIndex: self.parent.currentStepIndex,
            tx: self.parent.tx,
            address: result[2].value
          }, self.storageResolver, self.traceManager)
          localDecoder.solidityLocals(self.parent.currentStepIndex, self.internalTreeCall, stack, memory, storageViewer, sourceLocation).then((locals) => {
            if (!locals.error) {
              self.basicPanel.update(locals)
            }
            if (!Object.keys(locals).length) {
              self.basicPanel.setMessage('no locals')
            }
          })
        } catch (e) {
          self.basicPanel.setMessage(e.message)
        }
      } else {
        console.log(error)
      }
    })
}
module.exports = SolidityLocals
