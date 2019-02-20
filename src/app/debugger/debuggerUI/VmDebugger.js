'use strict'
var csjs = require('csjs-inject')
var yo = require('yo-yo')

var CodeListView = require('./vmDebugger/CodeListView')
var CalldataPanel = require('./vmDebugger/CalldataPanel')
var MemoryPanel = require('./vmDebugger/MemoryPanel')
var CallstackPanel = require('./vmDebugger/CallstackPanel')
var StackPanel = require('./vmDebugger/StackPanel')
var StoragePanel = require('./vmDebugger/StoragePanel')
var StepDetail = require('./vmDebugger/StepDetail')
var SolidityState = require('./vmDebugger/SolidityState')
var SolidityLocals = require('./vmDebugger/SolidityLocals')
var FullStoragesChangesPanel = require('./vmDebugger/FullStoragesChanges')
var DropdownPanel = require('./vmDebugger/DropdownPanel')

var css = csjs`
  .asmCode {
  }
  .stepDetail {
  }
  .vmheadView {
    margin-top:10px;
  }
`

function VmDebugger (vmDebuggerLogic) {
  var self = this
  this.view

  this.vmDebuggerLogic = vmDebuggerLogic

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
  this.vmDebuggerLogic.event.register('traceUnloaded', this.stepDetail.reset.bind(this.stepDetail))
  this.vmDebuggerLogic.event.register('newTraceLoaded', this.stepDetail.reset.bind(this.stepDetail))

  this.vmDebuggerLogic.event.register('traceCurrentStepUpdate', function (error, step) {
    self.stepDetail.updateField('execution step', (error ? '-' : step))
  })

  this.vmDebuggerLogic.event.register('traceMemExpandUpdate', function (error, addmem) {
    self.stepDetail.updateField('add memory', (error ? '-' : addmem))
  })

  this.vmDebuggerLogic.event.register('traceStepCostUpdate', function (error, gas) {
    self.stepDetail.updateField('gas', (error ? '-' : gas))
  })

  this.vmDebuggerLogic.event.register('traceCurrentCalledAddressAtUpdate', function (error, address) {
    self.stepDetail.updateField('loaded address', (error ? '-' : address))
  })

  this.vmDebuggerLogic.event.register('traceRemainingGasUpdate', function (error, remainingGas) {
    self.stepDetail.updateField('remaining gas', (error ? '-' : remainingGas))
  })

  this.vmDebuggerLogic.event.register('indexUpdate', function (index) {
    self.stepDetail.updateField('vm trace step', index)
  })

  this.solidityState = new SolidityState()
  this.vmDebuggerLogic.event.register('solidityState', this.solidityState.update.bind(this.solidityState))
  this.vmDebuggerLogic.event.register('solidityStateMessage', this.solidityState.setMessage.bind(this.solidityState))
  this.vmDebuggerLogic.event.register('solidityStateUpdating', this.solidityState.setUpdating.bind(this.solidityState))

  this.solidityLocals = new SolidityLocals()
  this.vmDebuggerLogic.event.register('solidityLocals', this.solidityLocals.update.bind(this.solidityLocals))
  this.vmDebuggerLogic.event.register('solidityLocalsMessage', this.solidityLocals.setMessage.bind(this.solidityLocals))
  this.vmDebuggerLogic.event.register('solidityLocalsUpdating', this.solidityLocals.setUpdating.bind(this.solidityLocals))

  this.returnValuesPanel = new DropdownPanel('Return Value', {json: true})
  this.returnValuesPanel.data = {}
  this.vmDebuggerLogic.event.register('traceReturnValueUpdate', this.returnValuesPanel.update.bind(this.returnValuesPanel))

  this.fullStoragesChangesPanel = new FullStoragesChangesPanel()
  this.addresses = []

  this.vmDebuggerLogic.event.register('traceAddressesUpdate', function (_addresses) {
    self.fullStoragesChangesPanel.update({})
  })

  this.vmDebuggerLogic.event.register('traceStorageUpdate', this.fullStoragesChangesPanel.update.bind(this.fullStoragesChangesPanel))

  this.vmDebuggerLogic.event.register('newTrace', () => {
    if (!self.view) return

    self.asmCode.basicPanel.show()
    self.stackPanel.basicPanel.show()
    self.storagePanel.basicPanel.show()
    self.memoryPanel.basicPanel.show()
    self.calldataPanel.basicPanel.show()
    self.callstackPanel.basicPanel.show()
  })

  this.vmDebuggerLogic.event.register('newCallTree', () => {
    if (!self.view) return
    self.solidityLocals.basicPanel.show()
    self.solidityState.basicPanel.show()
  })

  this.vmDebuggerLogic.start()
}

VmDebugger.prototype.renderHead = function () {
  var headView = yo`<div id='vmheadView' class="${css.vmheadView} container">
        <div class="row" >
          <div class="${css.asmCode} column">${this.asmCode.render()}</div>
          <div class="${css.stepDetail} column">${this.stepDetail.render()}</div>
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
