var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var localDecoder = require('../solidity-decoder/localDecoder')
var StorageViewer = require('../storage/storageViewer')

class DebuggerSolidityLocals {

  constructor (tx, _stepManager, _traceManager, _internalTreeCall) {
    this.event = new EventManager()
    this.stepManager = _stepManager
    this.internalTreeCall = _internalTreeCall
    this.storageResolver = null
    this.traceManager = _traceManager
    this.tx = tx
  }

  init (sourceLocation) {
    const self = this
    var decodeTimeout = null
    if (!this.storageResolver) {
      return self.event.trigger('solidityLocalsMessage', ['storage not ready'])
    }
    if (decodeTimeout) {
      window.clearTimeout(decodeTimeout)
    }
    self.event.trigger('solidityLocalsUpdating')
    decodeTimeout = setTimeout(function () {
      self.decode(sourceLocation)
    }, 500)
  }

  decode (sourceLocation) {
    const self = this
    self.event.trigger('solidityLocalsMessage', [''])
    self.traceManager.waterfall([
      self.traceManager.getStackAt,
      self.traceManager.getMemoryAt,
      self.traceManager.getCurrentCalledAddressAt],
      self.stepManager.currentStepIndex,
      (error, result) => {
        if (error) {
          return error
        }
        var stack = result[0].value
        var memory = result[1].value
        try {
          var storageViewer = new StorageViewer({ stepIndex: self.stepManager.currentStepIndex, tx: self.tx, address: result[2].value }, self.storageResolver, self.traceManager)
          localDecoder.solidityLocals(self.stepManager.currentStepIndex, self.internalTreeCall, stack, memory, storageViewer, sourceLocation).then((locals) => {
            if (!locals.error) {
              self.event.trigger('solidityLocals', [locals])
            }
            if (!Object.keys(locals).length) {
              self.event.trigger('solidityLocalsMessage', ['no locals'])
            }
          })
        } catch (e) {
          self.event.trigger('solidityLocalsMessage', [e.message])
        }
      })
  }

}

module.exports = DebuggerSolidityLocals
