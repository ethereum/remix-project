'use strict'
var style = require('./styles/basicStyles')
var ASMCode = require('./ASMCode')
var CalldataPanel = require('./CalldataPanel')
var MemoryPanel = require('./MemoryPanel')
var CallstackPanel = require('./CallstackPanel')
var StackPanel = require('./StackPanel')
var StoragePanel = require('./StoragePanel')
var yo = require('yo-yo')
var ui = require('./helpers/ui')

function VmDebugger (_parent, _traceManager, _web3) {
  this.asmCode = new ASMCode(_parent, _traceManager, _web3)
  this.stackPanel = new StackPanel(_parent, _traceManager)
  this.storagePanel = new StoragePanel(_parent, _traceManager)
  this.memoryPanel = new MemoryPanel(_parent, _traceManager)
  this.calldataPanel = new CalldataPanel(_parent, _traceManager)
  this.callstackPanel = new CallstackPanel(_parent, _traceManager)
  this.view
  var self = this
  _parent.register('newTraceLoaded', this, function () {
    self.view.style.display = 'block'
  })
  _parent.register('traceUnloaded', this, function () {
    self.view.style.display = 'none'
  })
}

VmDebugger.prototype.render = function () {
  var view = yo`<div id='vmdebugger' style='display:none'>
        <div style=${ui.formatCss(style.container)}>
          <table>
            <tbody>
              <tr>
                <td>                  
                  ${this.asmCode.render()}
                </td>
                 ${this.stackPanel.render()}
              </tr>
              <tr>
               ${this.storagePanel.render()}
                ${this.memoryPanel.render()}
              </tr>
              <tr>
                ${this.calldataPanel.render()}
                ${this.callstackPanel.render()}
              </tr>
            </tbody>
          </table>
        </div>
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = VmDebugger
