'use strict'
var csjs = require('csjs-inject')
var CodeListView = require('./vmDebugger/CodeListView')
var CalldataPanel = require('./vmDebugger/CalldataPanel')
var MemoryPanel = require('./vmDebugger/MemoryPanel')
var CallstackPanel = require('./vmDebugger/CallstackPanel')
var StackPanel = require('./vmDebugger/StackPanel')
var StoragePanel = require('./vmDebugger/StoragePanel')
var StepDetail = require('./vmDebugger/StepDetail')

var DebuggerSolidityState = require('../solidityState')
var DebuggerSolidityLocals = require('../solidityLocals')
var SolidityState = require('./vmDebugger/SolidityState')
var SolidityLocals = require('./vmDebugger/SolidityLocals')

var FullStoragesChangesPanel = require('./vmDebugger/FullStoragesChanges')
var DropdownPanel = require('./vmDebugger/DropdownPanel')
var remixDebug = require('remix-debug')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var ui = remixLib.helpers.ui
var StorageResolver = remixDebug.storage.StorageResolver
var StorageViewer = remixDebug.storage.StorageViewer
var yo = require('yo-yo')

var css = csjs`
  .asmCode {
    float: left;
    width: 50%;
  }
  .stepDetail {
  }
  .vmheadView {
    margin-top:10px;
  }
`

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
  }

  start() {
    this.listenToEvents()
    this.listenToCodeManagerEvents()
    this.listenToTraceManagerEvents()
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
        if (!self.storageResolver){
          return;
        }
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
    })
  }

}

function VmDebugger (_parentUI, _traceManager, _codeManager, _solidityProxy, _callTree) {
  let _parent = _parentUI.debugger
  var self = this
  this.view

  this.vmDebuggerLogic = new VmDebuggerLogic(_parentUI, _traceManager, _codeManager, _solidityProxy, _callTree)

  this.asmCode = new CodeListView()
  this.vmDebuggerLogic.event.register('codeManagerChanged', this.asmCode.changed.bind(this.asmCode))
  this.vmDebuggerLogic.event.register('traceUnloaded', this.asmCode.reset.bind(this.asmCode))

  this.calldataPanel = new CalldataPanel()
  this.vmDebuggerLogic.event.register('traceManagerCallDataUpdate', this.calldataPanel.update.bind(this.calldataPanel))

  this.memoryPanel = new MemoryPanel()
  this.vmDebuggerLogic.event.register('traceManagerMemoryUpdate', this.memoryPanel.update.bind(this.memoryPanel))

  this.callstackPanel = new CallstackPanel()
  this.vmDebuggerLogic.event.register('traceManagerCallStackUpdate', this.callstackPanel.update.bind(this.callstackPanel))

  this.stackPanel = new StackPanel()
  this.vmDebuggerLogic.event.register('traceManagerStackUpdate', this.stackPanel.update.bind(this.stackPanel))

  this.storagePanel = new StoragePanel()
  this.vmDebuggerLogic.event.register('traceManagerStorageUpdate', this.storagePanel.update.bind(this.storagePanel))

  this.stepDetail = new StepDetail()
  _parentUI.debugger.event.register('traceUnloaded', this, function () {
    self.stepDetail.reset()
  })
  _parentUI.debugger.event.register('newTraceLoaded', this, function () {
    self.stepDetail.reset()
  })

  _parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return

    self.stepDetail.updateField('vm trace step', index)

    _traceManager.getCurrentStep(index, function (error, step) {
      self.stepDetail.updateField('execution step', (error ? '-' : step))
    })

    _traceManager.getMemExpand(index, function (error, addmem) {
      self.stepDetail.updateField('add memory', (error ? '-' : addmem))
    })

    _traceManager.getStepCost(index, function (error, gas) {
      self.stepDetail.updateField('gas', (error ? '-' : gas))
    })

    _traceManager.getCurrentCalledAddressAt(index, function (error, address) {
      self.stepDetail.updateField('loaded address', (error ? '-' : address))
    })

    _traceManager.getRemainingGas(index, function (error, remaingas) {
      self.stepDetail.updateField('remaining gas', (error ? '-' : remaingas))
    })
  })

  this.debuggerSolidityState = new DebuggerSolidityState(_parentUI, _traceManager, _codeManager, _solidityProxy)
  this.solidityState = new SolidityState()
  this.debuggerSolidityState.init()
  this.debuggerSolidityState.event.register('solidityState', this, function (state) {
    self.solidityState.update(state)
  })
  this.debuggerSolidityState.event.register('solidityStateMessage', this, function (message) {
    self.solidityState.setMessage(message)
  })
  this.debuggerSolidityState.event.register('solidityStateUpdating', this, function () {
    self.solidityState.setUpdating()
  })

  this.debuggerSolidityLocals = new DebuggerSolidityLocals(_parentUI, _traceManager, _callTree)
  this.solidityLocals = new SolidityLocals()
  this.debuggerSolidityLocals.event.register('solidityLocals', this, function (state) {
    self.solidityLocals.update(state)
  })
  this.debuggerSolidityLocals.event.register('solidityLocalsMessage', this, function (message) {
    self.solidityLocals.setMessage(message)
  })
  this.debuggerSolidityLocals.event.register('solidityLocalsUpdating', this, function () {
    self.solidityLocals.setUpdating()
  })
  this.debuggerSolidityLocals.init()

  /* Return values - */
  this.returnValuesPanel = new DropdownPanel('Return Value', {json: true})
  this.returnValuesPanel.data = {}
  _parentUI.event.register('indexChanged', this.returnValuesPanel, function (index) {
    if (!self.view) return
    var innerself = this
    _traceManager.getReturnValue(index, function (error, returnValue) {
      if (error) {
        innerself.update([error])
      } else if (_parentUI.currentStepIndex === index) {
        innerself.update([returnValue])
      }
    })
  })
  /* Return values - */

  this.fullStoragesChangesPanel = new FullStoragesChangesPanel(_parentUI, _traceManager)
  this.addresses = []
  _parentUI.debugger.event.register('newTraceLoaded', this, function (length) {
    self.panels = []
    _traceManager.getAddresses(function (error, addresses) {
      if (!error) {
        self.addresses = addresses
        self.fullStoragesChangesPanel.update({})
      }
    })

    _traceManager.getLength(function (error, length) {
      if (!error) {
        self.traceLength = length
      }
    })
  })

  _parentUI.debugger.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (_parent.currentStepIndex !== index) return
    if (!self.vmDebuggerLogic.storageResolver) return

    if (index === self.traceLength - 1) {
      var storageJSON = {}
      for (var k in self.addresses) {
        var address = self.addresses[k]
        var storageViewer = new StorageViewer({ stepIndex: _parent.currentStepIndex, tx: _parent.tx, address: address }, self.vmDebuggerLogic.storageResolver, _traceManager)
        storageViewer.storageRange(function (error, result) {
          if (!error) {
            storageJSON[address] = result
            self.fullStoragesChangesPanel.update(storageJSON)
          }
        })
      }
    } else {
      self.fullStoragesChangesPanel.update({})
    }
  })

  _parent.event.register('newTraceLoaded', this, function () {
    if (!self.view) return
    self.vmDebuggerLogic.storageResolver = new StorageResolver({web3: _parent.web3})
    // self.solidityState.storageResolver = self.storageResolver
    self.debuggerSolidityState.storageResolver = self.vmDebuggerLogic.storageResolver
    self.debuggerSolidityLocals.storageResolver = self.vmDebuggerLogic.storageResolver
    // self.fullStoragesChangesPanel.storageResolver = self.storageResolver
    self.asmCode.basicPanel.show()
    self.stackPanel.basicPanel.show()
    self.storagePanel.basicPanel.show()
    self.memoryPanel.basicPanel.show()
    self.calldataPanel.basicPanel.show()
    self.callstackPanel.basicPanel.show()
  })
  _parent.callTree.event.register('callTreeReady', () => {
    if (!self.view) return
    if (_parent.callTree.reducedTrace.length) {
      self.solidityLocals.basicPanel.show()
      self.solidityState.basicPanel.show()
    }
  })

  this.vmDebuggerLogic.start()
}

VmDebugger.prototype.renderHead = function () {
  var headView = yo`<div id='vmheadView' class=${css.vmheadView}>
        <div>
          <div class=${css.asmCode}>${this.asmCode.render()}</div>
          <div class=${css.stepDetail}>${this.stepDetail.render()}</div>
        </div>
      </div>`
  if (!this.headView) {
    this.headView = headView
  }
  return headView
}

VmDebugger.prototype.remove = function () {
  // used to stop listenning on event. bad and should be "refactored"
  this.view = null
}

VmDebugger.prototype.render = function () {
  var view = yo`<div id='vmdebugger'>
        <div>
            ${this.solidityLocals.render()}
            ${this.solidityState.render()}
            ${this.stackPanel.render()}
            ${this.memoryPanel.render()}
            ${this.storagePanel.render()}
            ${this.callstackPanel.render()}
            ${this.calldataPanel.render()}
            ${this.returnValuesPanel.render()}
            ${this.fullStoragesChangesPanel.render()}
          </div>
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = VmDebugger
