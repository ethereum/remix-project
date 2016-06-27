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
  this.CallstackPanel = new CallstackPanel(_parent, _traceManager)
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
  var view = yo`<div style='display:none'>
        <div style=${ui.formatCss(style.container)}>
          <table>
            <tbody>
              <tr>
                <td>
                  
                  ${this.asmCode.render()}
                </td>
                <td>
                  ${this.stackPanel.render()}
                </td>
              </tr>
              <tr>
                <td>
                  ${this.storagePanel.render()}
                </td>
                <td>
                  ${this.memoryPanel.render()}
                </td>
              </tr>
              <tr>
                <td>
                  ${this.calldataPanel.render()}
                </td>
                <td>
                  ${this.CallstackPanel.render()}
                </td>
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
