import { EventManager } from '../eventManager'
import { solidityLocals } from '../solidity-decoder/localDecoder'
import { StorageViewer } from '../storage/storageViewer'

export class DebuggerSolidityLocals {

  event
  stepManager
  internalTreeCall
  storageResolver
  traceManager
  tx
  _sourceLocation

  constructor (tx, _stepManager, _traceManager, _internalTreeCall) {
    this.event = new EventManager()
    this.stepManager = _stepManager
    this.internalTreeCall = _internalTreeCall
    this.storageResolver = null
    this.traceManager = _traceManager
    this.tx = tx
  }

  init (sourceLocation) {
    this._sourceLocation = sourceLocation
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

  decode (sourceLocation, cursor?) {
    const self = this
    this.event.trigger('solidityLocalsMessage', [''])
    this.traceManager.waterfall([
      function getStackAt (stepIndex, callback) {
        try {
          const result = self.traceManager.getStackAt(stepIndex)
          callback(null, result)
        } catch (error) {
          callback(error)
        }
      },
      function getMemoryAt (stepIndex, callback) {
        try {
          const result = self.traceManager.getMemoryAt(stepIndex)
          callback(null, result)
        } catch (error) {
          callback(error)
        }
      },
      function getCurrentCalledAddressAt (stepIndex, next) {
        try {
          const address = self.traceManager.getCurrentCalledAddressAt(stepIndex)
          next(null, address)
        } catch (error) {
          next(error)
        }
      }],
    this.stepManager.currentStepIndex,
    (error, result) => {
      if (error) {
        return error
      }
      var stack = result[0].value
      var memory = result[1].value
      try {
        var storageViewer = new StorageViewer({ stepIndex: this.stepManager.currentStepIndex, tx: this.tx, address: result[2].value }, this.storageResolver, this.traceManager)
        solidityLocals(this.stepManager.currentStepIndex, this.internalTreeCall, stack, memory, storageViewer, sourceLocation, cursor).then((locals) => {
          if (!cursor) {
            if (!locals['error']) {
              this.event.trigger('solidityLocals', [locals])
            }
            if (!Object.keys(locals).length) {
              this.event.trigger('solidityLocalsMessage', ['no locals'])
            }
          } else {
            if (!locals['error']) {
              this.event.trigger('solidityLocalsLoadMoreCompleted', [locals])
            }
          }
        })
      } catch (e) {
        this.event.trigger('solidityLocalsMessage', [e.message])
      }
    })
  }

  decodeMore (cursor) {
    let decodeTimeout = null
    if (!this.storageResolver) return this.event.trigger('solidityLocalsMessage', ['storage not ready'])
    if (decodeTimeout) window.clearTimeout(decodeTimeout)
    decodeTimeout = setTimeout(() => {
      this.decode(this._sourceLocation, cursor)
    }, 500)
  }
}
