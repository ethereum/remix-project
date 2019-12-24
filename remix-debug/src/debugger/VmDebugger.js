const remixLib = require('remix-lib')
const EventManager = remixLib.EventManager
const ui = remixLib.helpers.ui
const StorageResolver = require('../storage/storageResolver')
const StorageViewer = require('../storage/storageViewer')

const DebuggerSolidityState = require('./solidityState')
const DebuggerSolidityLocals = require('./solidityLocals')

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
    this.debugger.event.register('traceUnloaded', () => {
      this.event.trigger('traceUnloaded')
    })

    this.debugger.event.register('newTraceLoaded', () => {
      this.event.trigger('newTraceLoaded')
    })
  }

  listenToCodeManagerEvents () {
    this._codeManager.event.register('changed', (code, address, index) => {
      this.event.trigger('codeManagerChanged', [code, address, index])
    })
  }

  listenToTraceManagerEvents () {
    this.event.register('indexChanged', this, (index) => {
      if (index < 0) return
      if (this.stepManager.currentStepIndex !== index) return

      this.event.trigger('indexUpdate', [index])

      this._traceManager.getCallDataAt(index, (error, calldata) => {
        if (error) {
          // console.log(error)
          this.event.trigger('traceManagerCallDataUpdate', [{}])
        } else if (this.stepManager.currentStepIndex === index) {
          this.event.trigger('traceManagerCallDataUpdate', [calldata])
        }
      })

      this._traceManager.getMemoryAt(index, (error, memory) => {
        if (error) {
          // console.log(error)
          this.event.trigger('traceManagerMemoryUpdate', [{}])
        } else if (this.stepManager.currentStepIndex === index) {
          this.event.trigger('traceManagerMemoryUpdate', [ui.formatMemory(memory, 16)])
        }
      })

      this._traceManager.getCallStackAt(index, (error, callstack) => {
        if (error) {
          // console.log(error)
          this.event.trigger('traceManagerCallStackUpdate', [{}])
        } else if (this.stepManager.currentStepIndex === index) {
          this.event.trigger('traceManagerCallStackUpdate', [callstack])
        }
      })

      this._traceManager.getStackAt(index, (error, callstack) => {
        if (error) {
          // console.log(error)
          this.event.trigger('traceManagerStackUpdate', [{}])
        } else if (this.stepManager.currentStepIndex === index) {
          this.event.trigger('traceManagerStackUpdate', [callstack])
        }
      })

      this._traceManager.getCurrentCalledAddressAt(index, (error, address) => {
        if (error) return
        if (!this.storageResolver) return

        var storageViewer = new StorageViewer({ stepIndex: this.stepManager.currentStepIndex, tx: this.tx, address: address }, this.storageResolver, this._traceManager)

        storageViewer.storageRange((error, storage) => {
          if (error) {
            // console.log(error)
            this.event.trigger('traceManagerStorageUpdate', [{}])
          } else if (this.stepManager.currentStepIndex === index) {
            var header = storageViewer.isComplete(address) ? 'completely loaded' : 'partially loaded...'
            this.event.trigger('traceManagerStorageUpdate', [storage, header])
          }
        })
      })

      this._traceManager.getCurrentStep(index, (error, step) => {
        this.event.trigger('traceCurrentStepUpdate', [error, step])
      })

      this._traceManager.getMemExpand(index, (error, addmem) => {
        this.event.trigger('traceMemExpandUpdate', [error, addmem])
      })

      this._traceManager.getStepCost(index, (error, gas) => {
        this.event.trigger('traceStepCostUpdate', [error, gas])
      })

      this._traceManager.getCurrentCalledAddressAt(index, (error, address) => {
        this.event.trigger('traceCurrentCalledAddressAtUpdate', [error, address])
      })

      this._traceManager.getRemainingGas(index, (error, remaining) => {
        this.event.trigger('traceRemainingGasUpdate', [error, remaining])
      })

      this._traceManager.getReturnValue(index, (error, returnValue) => {
        if (error) {
          this.event.trigger('traceReturnValueUpdate', [[error]])
        } else if (this.stepManager.currentStepIndex === index) {
          this.event.trigger('traceReturnValueUpdate', [[returnValue]])
        }
      })
    })
  }

  listenToFullStorageChanges () {
    this.address = []
    this.traceLength = 0

    this.debugger.event.register('newTraceLoaded', (length) => {
      this._traceManager.getAddresses((error, addresses) => {
        if (error) return
        this.event.trigger('traceAddressesUpdate', [addresses])
        this.addresses = addresses
      })

      this._traceManager.getLength((error, length) => {
        if (error) return
        this.event.trigger('traceLengthUpdate', [length])
        this.traceLength = length
      })
    })

    this.debugger.event.register('indexChanged', this, (index) => {
      if (index < 0) return
      if (this.stepManager.currentStepIndex !== index) return
      if (!this.storageResolver) return
      // Clean up storage update
      if (index === this.traceLength - 1) {
        return this.event.trigger('traceStorageUpdate', [{}])
      }
      var storageJSON = {}
      for (var k in this.addresses) {
        var address = this.addresses[k]
        var storageViewer = new StorageViewer({ stepIndex: this.stepManager.currentStepIndex, tx: this.tx, address: address }, this.storageResolver, this._traceManager)
        storageViewer.storageRange((error, result) => {
          if (!error) {
            storageJSON[address] = result
            this.event.trigger('traceStorageUpdate', [storageJSON])
          }
        })
      }
    })
  }

  listenToNewChanges () {
    this.debugger.event.register('newTraceLoaded', this, () => {
      this.storageResolver = new StorageResolver({web3: this.debugger.web3})
      this.debuggerSolidityState.storageResolver = this.storageResolver
      this.debuggerSolidityLocals.storageResolver = this.storageResolver
      this.event.trigger('newTrace', [])
    })

    this.debugger.callTree.event.register('callTreeReady', () => {
      if (this.debugger.callTree.reducedTrace.length) {
        return this.event.trigger('newCallTree', [])
      }
    })
  }

  listenToSolidityStateEvents () {
    this.event.register('indexChanged', this.debuggerSolidityState.init.bind(this.debuggerSolidityState))
    this.debuggerSolidityState.event.register('solidityState', (state) => {
      this.event.trigger('solidityState', [state])
    })
    this.debuggerSolidityState.event.register('solidityStateMessage', (message) => {
      this.event.trigger('solidityStateMessage', [message])
    })
    this.debuggerSolidityState.event.register('solidityStateUpdating', () => {
      this.event.trigger('solidityStateUpdating', [])
    })
    this.event.register('traceUnloaded', this.debuggerSolidityState.reset.bind(this.debuggerSolidityState))
    this.event.register('newTraceLoaded', this.debuggerSolidityState.reset.bind(this.debuggerSolidityState))
  }

  listenToSolidityLocalsEvents () {
    this.event.register('sourceLocationChanged', this.debuggerSolidityLocals.init.bind(this.debuggerSolidityLocals))
    this.debuggerSolidityLocals.event.register('solidityLocals', (state) => {
      this.event.trigger('solidityLocals', [state])
    })
    this.debuggerSolidityLocals.event.register('solidityLocalsMessage', (message) => {
      this.event.trigger('solidityLocalsMessage', [message])
    })
    this.debuggerSolidityLocals.event.register('solidityLocalsUpdating', () => {
      this.event.trigger('solidityLocalsUpdating', [])
    })
    this.debuggerSolidityLocals.event.register('traceReturnValueUpdate', (data, header) => {
      this.event.trigger('traceReturnValueUpdate', [data, header])
    })
  }

}

module.exports = VmDebuggerLogic
