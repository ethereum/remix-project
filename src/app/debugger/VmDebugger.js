var remixDebug = require('remix-debug')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var ui = remixLib.helpers.ui
var StorageResolver = remixDebug.storage.StorageResolver
var StorageViewer = remixDebug.storage.StorageViewer

var DebuggerSolidityState = require('./solidityState')
var DebuggerSolidityLocals = require('./solidityLocals')

class VmDebuggerLogic {

  constructor (_parentUI, _traceManager, _codeManager, _solidityProxy, _callTree) {
    this.event = new EventManager()
    this._parentUI = _parentUI
    this._parent = this._parentUI.debugger
    this._traceManager = _traceManager
    this._codeManager = _codeManager
    this._solidityProxy = _solidityProxy
    this._callTree = _callTree
    this.storageResolver = null

    this.debuggerSolidityState = new DebuggerSolidityState(_parentUI, _traceManager, _codeManager, _solidityProxy)
    this.debuggerSolidityLocals = new DebuggerSolidityLocals(_parentUI, _traceManager, _callTree)
  }

  start () {
    this.listenToEvents()
    this.listenToCodeManagerEvents()
    this.listenToTraceManagerEvents()
    this.listenToFullStorageChanges()
    this.listenToNewChanges()

    this.debuggerSolidityState.init()
    this.listenToSolidityStateEvents()

    this.debuggerSolidityLocals.init()
    this.listenToSolidityLocalsEvents()
  }

  listenToEvents () {
    const self = this
    this._parent.event.register('traceUnloaded', function () {
      self.event.trigger('traceUnloaded')
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

    this._parentUI.event.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (self._parentUI.currentStepIndex !== index) return

      self.event.trigger('indexUpdate', [index])

      self._traceManager.getCallDataAt(index, function (error, calldata) {
        if (error) {
          console.log(error)
          self.event.trigger('traceManagerCallDataUpdate', [{}])
        } else if (self._parentUI.currentStepIndex === index) {
          self.event.trigger('traceManagerCallDataUpdate', [calldata])
        }
      })

      self._traceManager.getMemoryAt(index, function (error, memory) {
        if (error) {
          console.log(error)
          self.event.trigger('traceManagerMemoryUpdate', [{}])
        } else if (self._parentUI.currentStepIndex === index) {
          self.event.trigger('traceManagerMemoryUpdate', [ui.formatMemory(memory, 16)])
        }
      })

      self._traceManager.getCallStackAt(index, function (error, callstack) {
        if (error) {
          console.log(error)
          self.event.trigger('traceManagerCallStackUpdate', [{}])
        } else if (self._parentUI.currentStepIndex === index) {
          self.event.trigger('traceManagerCallStackUpdate', [callstack])
        }
      })

      self._traceManager.getStackAt(index, function (error, callstack) {
        if (error) {
          console.log(error)
          self.event.trigger('traceManagerStackUpdate', [{}])
        } else if (self._parentUI.currentStepIndex === index) {
          self.event.trigger('traceManagerStackUpdate', [callstack])
        }
      })

      self._traceManager.getCurrentCalledAddressAt(index, (error, address) => {
        if (error) return
        if (!self.storageResolver) return

        var storageViewer = new StorageViewer({ stepIndex: self._parentUI.currentStepIndex, tx: self._parentUI.tx, address: address }, self.storageResolver, self._traceManager)

        storageViewer.storageRange((error, storage) => {
          if (error) {
            console.log(error)
            self.event.trigger('traceManagerStorageUpdate', [{}])
          } else if (self._parentUI.currentStepIndex === index) {
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
        } else if (self._parentUI.currentStepIndex === index) {
          self.event.trigger('traceReturnValueUpdate', [[returnValue]])
        }
      })
    })
  }

  listenToFullStorageChanges () {
    const self = this

    this.address = []
    this.traceLength = 0

    self._parentUI.debugger.event.register('newTraceLoaded', function (length) {
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

    self._parentUI.debugger.event.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (self._parent.currentStepIndex !== index) return
      if (!self.storageResolver) return

      if (index !== self.traceLength - 1) {
        return self.event.trigger('traceLengthUpdate', [{}])
      }
      var storageJSON = {}
      for (var k in self.addresses) {
        var address = self.addresses[k]
        var storageViewer = new StorageViewer({ stepIndex: self._parent.currentStepIndex, tx: self._parent.tx, address: address }, self.storageResolver, self._traceManager)
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
    self._parent.event.register('newTraceLoaded', this, function () {
      self.storageResolver = new StorageResolver({web3: self._parent.web3})
      self.debuggerSolidityState.storageResolver = self.storageResolver
      self.debuggerSolidityLocals.storageResolver = self.storageResolver

      // self.debuggerSolidityState.storageResolver = self.vmDebuggerLogic.storageResolver
      // self.solidityState.storageResolver = self.storageResolver
      // self.fullStoragesChangesPanel.storageResolver = self.storageResolver

      self.event.trigger('newTrace', [])
    })

    self._parent.event.register('callTreeReady', function () {
      if (self._parent.callTree.reducedTrace.length) {
        return self.event.trigger('newCallTree', [])
      }
    })
  }

  listenToSolidityStateEvents () {
    const self = this
    this.debuggerSolidityState.event.register('solidityState', function (state) {
      self.event.trigger('solidityState', [state])
    })
    this.debuggerSolidityState.event.register('solidityStateMessage', function (message) {
      self.event.trigger('solidityStateMessage', [message])
    })
    this.debuggerSolidityState.event.register('solidityStateUpdating', function () {
      self.event.trigger('solidityStateUpdating', [])
    })
  }

  listenToSolidityLocalsEvents () {
    const self = this

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
