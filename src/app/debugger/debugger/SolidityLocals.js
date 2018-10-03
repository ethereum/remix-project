var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var remixDebug = require('remix-debug')
var localDecoder = remixDebug.SolidityDecoder.localDecoder
var StorageViewer = remixDebug.storage.StorageViewer

class DebuggerSolidityLocals {

  constructor (_parent, _traceManager, _internalTreeCall) {
    this.event = new EventManager()
    this.parent = _parent
    this.internalTreeCall = _internalTreeCall
    this.storageResolver = null
    this.traceManager = _traceManager
  }

  init () {
    const self = this
    var decodeTimeout = null
    this.parent.event.register('sourceLocationChanged', this, (sourceLocation) => {
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
    })
  }

  decode (sourceLocation) {
    const self = this
    self.event.trigger('solidityLocalsMessage', [''])
    self.traceManager.waterfall([
      self.traceManager.getStackAt,
      self.traceManager.getMemoryAt,
      self.traceManager.getCurrentCalledAddressAt],
      self.parent.currentStepIndex,
      (error, result) => {
        if (error) {
          return console.log(error)
        }
        var stack = result[0].value
        var memory = result[1].value
        try {
          var storageViewer = new StorageViewer({ stepIndex: self.parent.currentStepIndex, tx: self.parent.tx, address: result[2].value }, self.storageResolver, self.traceManager)
          localDecoder.solidityLocals(self.parent.currentStepIndex, self.internalTreeCall, stack, memory, storageViewer, sourceLocation).then((locals) => {
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
