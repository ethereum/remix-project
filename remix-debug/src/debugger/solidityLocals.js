const remixLib = require('remix-lib')
const EventManager = remixLib.EventManager

const localDecoder = require('../solidity-decoder/localDecoder')
const StorageViewer = require('../storage/storageViewer')

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
    var decodeTimeout = null
    if (!this.storageResolver) {
      return this.event.trigger('solidityLocalsMessage', ['storage not ready'])
    }
    if (decodeTimeout) {
      window.clearTimeout(decodeTimeout)
    }
    this.event.trigger('solidityLocalsUpdating')
    decodeTimeout = setTimeout(() => {
      this.decode(sourceLocation)
    }, 500)
  }

  decode (sourceLocation) {
    this.event.trigger('solidityLocalsMessage', [''])
    this.traceManager.waterfall([
      this.traceManager.getStackAt,
      this.traceManager.getMemoryAt,
      this.traceManager.getCurrentCalledAddressAt],
      this.stepManager.currentStepIndex,
      (error, result) => {
        if (error) {
          return error
        }
        var stack = result[0].value
        var memory = result[1].value
        try {
          var storageViewer = new StorageViewer({ stepIndex: this.stepManager.currentStepIndex, tx: this.tx, address: result[2].value }, this.storageResolver, this.traceManager)
          localDecoder.solidityLocals(this.stepManager.currentStepIndex, this.internalTreeCall, stack, memory, storageViewer, sourceLocation).then((locals) => {
            if (!locals.error) {
              this.event.trigger('solidityLocals', [locals])
            }
            if (!Object.keys(locals).length) {
              this.event.trigger('solidityLocalsMessage', ['no locals'])
            }
          })
        } catch (e) {
          this.event.trigger('solidityLocalsMessage', [e.message])
        }
      })
  }

}

module.exports = DebuggerSolidityLocals
