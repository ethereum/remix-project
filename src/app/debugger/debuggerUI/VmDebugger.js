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

    this.listenToEvents()
    this.listenToCodeManagerEvents()
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
}

function VmDebugger (_parentUI, _traceManager, _codeManager, _solidityProxy, _callTree) {
  let _parent = _parentUI.debugger
  var self = this
  this.view
  this.storageResolver = null

  this.vmDebuggerLogic = new VmDebuggerLogic(_parentUI, _traceManager, _codeManager, _solidityProxy, _callTree)

  this.asmCode = new CodeListView()
  this.vmDebuggerLogic.event.register('codeManagerChanged', this.asmCode.changed.bind(this.asmCode))
  this.vmDebuggerLogic.event.register('traceUnloaded', function () {
    self.asmCode.changed([], '', -1)
  })

  this.calldataPanel = new CalldataPanel()
  _parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (_parentUI.currentStepIndex !== index) return

    _traceManager.getCallDataAt(index, function (error, calldata) {
      if (error) {
        console.log(error)
        self.calldataPanel.update({})
      } else if (_parentUI.currentStepIndex === index) {
        self.calldataPanel.update(calldata)
      }
    })
  })

  this.memoryPanel = new MemoryPanel()
  _parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (_parentUI.currentStepIndex !== index) return

    _traceManager.getMemoryAt(index, function (error, memory) {
      if (error) {
        console.log(error)
        self.memoryPanel.update({})
      } else if (_parentUI.currentStepIndex === index) {
        self.memoryPanel.update(ui.formatMemory(memory, 16))
      }
    })
  })

  this.callstackPanel = new CallstackPanel()
  _parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (_parentUI.currentStepIndex !== index) return

    _traceManager.getMemoryAt(index, function (error, callstack) {
      if (error) {
        console.log(error)
        self.callstackPanel.update({})
      } else if (_parentUI.currentStepIndex === index) {
        self.callstackPanel.update(callstack)
      }
    })
  })

  this.stackPanel = new StackPanel()
  _parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (_parentUI.currentStepIndex !== index) return

    _traceManager.getMemoryAt(index, function (error, stack) {
      if (error) {
        console.log(error)
        self.stackPanel.update({})
      } else if (_parentUI.currentStepIndex === index) {
        self.stackPanel.update(stack)
      }
    })
  })

  this.storagePanel = new StoragePanel()
  _parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (_parentUI.currentStepIndex !== index) return
    if (!self.storageResolver) return

    _traceManager.getCurrentCalledAddressAt(index, (error, address) => {
      if (error) return
      var storageViewer = new StorageViewer({
        stepIndex: _parentUI.currentStepIndex,
        tx: _parentUI.tx,
        address: address
      }, self.storageResolver, _traceManager)

      storageViewer.storageRange((error, storage) => {
        if (error) {
          console.log(error)
          self.storagePanel.update({})
        } else if (_parentUI.currentStepIndex === index) {
          var header = storageViewer.isComplete(address) ? 'completely loaded' : 'partially loaded...'
          self.storagePanel.update(storage, header)
        }
      })
    })
  })

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
    if (!self.storageResolver) return

    if (index === self.traceLength - 1) {
      var storageJSON = {}
      for (var k in self.addresses) {
        var address = self.addresses[k]
        var storageViewer = new StorageViewer({ stepIndex: _parent.currentStepIndex, tx: _parent.tx, address: address }, self.storageResolver, _traceManager)
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
    self.storageResolver = new StorageResolver({web3: _parent.web3})
    // self.solidityState.storageResolver = self.storageResolver
    self.debuggerSolidityState.storageResolver = self.storageResolver
    self.debuggerSolidityLocals.storageResolver = self.storageResolver
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
