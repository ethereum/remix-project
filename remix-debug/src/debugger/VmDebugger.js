var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var ui = remixLib.helpers.ui
var StorageResolver = require('../storage/storageResolver')
var StorageViewer = require('../storage/storageViewer')

var DebuggerSolidityState = require('./solidityState')
var DebuggerSolidityLocals = require('./solidityLocals')

class VmDebuggerLogic {

  constructor (_debugger, tx, _stepManager, _traceManager, _codeManager, _solidityProxy, _callTree) {
    this.event = new EventManager()
    this.debugger = _debugger
    this.stepManager = _stepManager
    this._traceManager = _traceManager
    this._codeManager = _codeManager
    this._solidityProxy = _solidityProxy
    this._callTree = _callTree
    this.storageResolver = null
    this.tx = tx

    this.debuggerSolidityState = new DebuggerSolidityState(tx, _stepManager, _traceManager, _codeManager, _solidityProxy)
    this.debuggerSolidityLocals = new DebuggerSolidityLocals(tx, _stepManager, _traceManager, _callTree)
  }

  start () {
    this.listenToEvents()
    this.listenToCodeManagerEvents()
    this.listenToTraceManagerEvents()
    this.listenToFullStorageChanges()
    this.listenToNewChanges()

    this.listenToSolidityStateEvents()
    this.listenToSolidityLocalsEvents()
  }

  listenToEvents () {
    const self = this
    this.debugger.event.register('traceUnloaded', function () {
      self.event.trigger('traceUnloaded')
    })

    this.debugger.event.register('newTraceLoaded', function () {
      self.event.trigger('newTraceLoaded')
    })
  }

  listenToCodeManagerEvents () {
    const self = this
    this._codeManager.event.register('changed', function (code, address, index) {
      self.event.trigger('codeManagerChanged', [code, address, index])
    })
  }

  listenToTraceManagerEvents () {
    const self = this

    this.event.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (self.stepManager.currentStepIndex !== index) return

      self.event.trigger('indexUpdate', [index])

      self._traceManager.getCallDataAt(index, function (error, calldata) {
        if (error) {
          // console.log(error)
          self.event.trigger('traceManagerCallDataUpdate', [{}])
        } else if (self.stepManager.currentStepIndex === index) {
          self.event.trigger('traceManagerCallDataUpdate', [calldata])
        }
      })

      self._traceManager.getMemoryAt(index, function (error, memory) {
        if (error) {
          // console.log(error)
          self.event.trigger('traceManagerMemoryUpdate', [{}])
        } else if (self.stepManager.currentStepIndex === index) {
          self.event.trigger('traceManagerMemoryUpdate', [ui.formatMemory(memory, 16)])
        }
      })

      self._traceManager.getCallStackAt(index, function (error, callstack) {
        if (error) {
          // console.log(error)
          self.event.trigger('traceManagerCallStackUpdate', [{}])
        } else if (self.stepManager.currentStepIndex === index) {
          self.event.trigger('traceManagerCallStackUpdate', [callstack])
        }
      })

      self._traceManager.getStackAt(index, function (error, callstack) {
        if (error) {
          // console.log(error)
          self.event.trigger('traceManagerStackUpdate', [{}])
        } else if (self.stepManager.currentStepIndex === index) {
          self.event.trigger('traceManagerStackUpdate', [callstack])
        }
      })

      self._traceManager.getCurrentCalledAddressAt(index, (error, address) => {
        if (error) return
        if (!self.storageResolver) return

        var storageViewer = new StorageViewer({ stepIndex: self.stepManager.currentStepIndex, tx: self.tx, address: address }, self.storageResolver, self._traceManager)

        storageViewer.storageRange((error, storage) => {
          if (error) {
            // console.log(error)
            self.event.trigger('traceManagerStorageUpdate', [{}])
          } else if (self.stepManager.currentStepIndex === index) {
            var header = storageViewer.isComplete(address) ? 'completely loaded' : 'partially loaded...'
            self.event.trigger('traceManagerStorageUpdate', [storage, header])
          }
        })
      })

      self._traceManager.getCurrentStep(index, function (error, step) {
        self.event.trigger('traceCurrentStepUpdate', [error, step])
      })

      self._traceManager.getMemExpand(index, function (error, addmem) {
        self.event.trigger('traceMemExpandUpdate', [error, addmem])
      })

      self._traceManager.getStepCost(index, function (error, gas) {
        self.event.trigger('traceStepCostUpdate', [error, gas])
      })

      self._traceManager.getCurrentCalledAddressAt(index, function (error, address) {
        self.event.trigger('traceCurrentCalledAddressAtUpdate', [error, address])
      })

      self._traceManager.getRemainingGas(index, function (error, remaining) {
        self.event.trigger('traceRemainingGasUpdate', [error, remaining])
      })

      self._traceManager.getReturnValue(index, function (error, returnValue) {
        if (error) {
          self.event.trigger('traceReturnValueUpdate', [[error]])
        } else if (self.stepManager.currentStepIndex === index) {
          self.event.trigger('traceReturnValueUpdate', [[returnValue]])
        }
      })
    })
  }

  listenToFullStorageChanges () {
    const self = this

    this.address = []
    this.traceLength = 0

    self.debugger.event.register('newTraceLoaded', function (length) {
      self._traceManager.getAddresses(function (error, addresses) {
        if (error) return
        self.event.trigger('traceAddressesUpdate', [addresses])
        self.addresses = addresses
      })

      self._traceManager.getLength(function (error, length) {
        if (error) return
        self.event.trigger('traceLengthUpdate', [length])
        self.traceLength = length
      })
    })

    self.debugger.event.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (self.stepManager.currentStepIndex !== index) return
      if (!self.storageResolver) return

      if (index !== self.traceLength - 1) {
        return self.event.trigger('traceLengthUpdate', [{}])
      }
      var storageJSON = {}
      for (var k in self.addresses) {
        var address = self.addresses[k]
        var storageViewer = new StorageViewer({ stepIndex: self.stepManager.currentStepIndex, tx: self.tx, address: address }, self.storageResolver, self._traceManager)
        storageViewer.storageRange(function (error, result) {
          if (!error) {
            storageJSON[address] = result
            self.event.trigger('traceLengthUpdate', [storageJSON])
          }
        })
      }
    })
  }

  listenToNewChanges () {
    const self = this
    self.debugger.event.register('newTraceLoaded', this, function () {
      self.storageResolver = new StorageResolver({web3: self.debugger.web3})
      self.debuggerSolidityState.storageResolver = self.storageResolver
      self.debuggerSolidityLocals.storageResolver = self.storageResolver
      self.event.trigger('newTrace', [])
    })

    self.debugger.callTree.event.register('callTreeReady', function () {
      if (self.debugger.callTree.reducedTrace.length) {
        return self.event.trigger('newCallTree', [])
      }
    })
  }

  listenToSolidityStateEvents () {
    const self = this
    this.event.register('indexChanged', this.debuggerSolidityState.init.bind(this.debuggerSolidityState))
    this.debuggerSolidityState.event.register('solidityState', function (state) {
      self.event.trigger('solidityState', [state])
    })
    this.debuggerSolidityState.event.register('solidityStateMessage', function (message) {
      self.event.trigger('solidityStateMessage', [message])
    })
    this.debuggerSolidityState.event.register('solidityStateUpdating', function () {
      self.event.trigger('solidityStateUpdating', [])
    })
    this.event.register('traceUnloaded', this.debuggerSolidityState.reset.bind(this.debuggerSolidityState))
    this.event.register('newTraceLoaded', this.debuggerSolidityState.reset.bind(this.debuggerSolidityState))
  }

  listenToSolidityLocalsEvents () {
    const self = this
    this.event.register('sourceLocationChanged', this.debuggerSolidityLocals.init.bind(this.debuggerSolidityLocals))
    this.debuggerSolidityLocals.event.register('solidityLocals', function (state) {
      self.event.trigger('solidityLocals', [state])
    })
    this.debuggerSolidityLocals.event.register('solidityLocalsMessage', function (message) {
      self.event.trigger('solidityLocalsMessage', [message])
    })
    this.debuggerSolidityLocals.event.register('solidityLocalsUpdating', function () {
      self.event.trigger('solidityLocalsUpdating', [])
    })
    this.debuggerSolidityLocals.event.register('traceReturnValueUpdate', function (data, header) {
      self.event.trigger('traceReturnValueUpdate', [data, header])
    })
  }

}

module.exports = VmDebuggerLogic
