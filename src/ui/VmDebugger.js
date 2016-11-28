'use strict'
var CodeListView = require('./CodeListView')
var CalldataPanel = require('./CalldataPanel')
var MemoryPanel = require('./MemoryPanel')
var CallstackPanel = require('./CallstackPanel')
var StackPanel = require('./StackPanel')
var StoragePanel = require('./StoragePanel')
var FullStoragesChangesPanel = require('./FullStoragesChanges')
var StepDetail = require('./StepDetail')
var DropdownPanel = require('./DropdownPanel')
var SolidityState = require('./SolidityState')
var yo = require('yo-yo')

function VmDebugger (_parent, _traceManager, _codeManager) {
  this.asmCode = new CodeListView(_parent, _codeManager)
  this.stackPanel = new StackPanel(_parent, _traceManager)
  this.storagePanel = new StoragePanel(_parent, _traceManager)
  this.memoryPanel = new MemoryPanel(_parent, _traceManager)
  this.calldataPanel = new CalldataPanel(_parent, _traceManager)
  this.callstackPanel = new CallstackPanel(_parent, _traceManager)
  this.stepDetail = new StepDetail(_parent, _traceManager)
  this.solidityState = new SolidityState(_parent, _traceManager, _codeManager)

  /* Return values - */
  this.returnValuesPanel = new DropdownPanel('Return Value')
  this.returnValuesPanel.data = {}
  _parent.event.register('indexChanged', this.returnValuesPanel, function (index) {
    var self = this
    _traceManager.getReturnValue(index, function (error, returnValue) {
      if (error) {
        self.data = [error]
      } else if (_parent.currentStepIndex === index) {
        self.data = [returnValue]
      }
      self.update()
    })
  })
  /* Return values - */

  this.fullStoragesChangesPanel = new FullStoragesChangesPanel(_parent, _traceManager)

  this.view
  var self = this
  _parent.event.register('newTraceLoaded', this, function () {
    self.view.style.display = 'block'
  })
  _parent.event.register('traceUnloaded', this, function () {
    self.view.style.display = 'none'
  })
}

VmDebugger.prototype.render = function () {
  var view = yo`<div id='vmdebugger' style='display:none'>
        <div>
            ${this.asmCode.render()}
            ${this.solidityState.render()}
            ${this.stepDetail.render()}
            ${this.stackPanel.render()}
            ${this.storagePanel.render()}
            ${this.memoryPanel.render()}
            ${this.calldataPanel.render()}
            ${this.callstackPanel.render()}
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
