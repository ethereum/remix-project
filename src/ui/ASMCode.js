'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var CodeManager = require('../code/codeManager')
var ui = require('../helpers/ui')

function ASMCode (_parent, _traceManager, _web3) {
  this.parent = _parent
  this.codeManager = new CodeManager(_web3, _traceManager)
  this.code
  this.address
  this.codeView

  this.init()
}

ASMCode.prototype.render = function () {
  var view = (
    yo`<select size='10' id='asmitems' ref='itemsList' style=${ui.formatCss(style.instructionsList)}>
      ${this.codeView}
    </select>`
  )
  if (!this.view) {
    this.view = view
  }
  return view
}

ASMCode.prototype.init = function () {
  var self = this
  this.codeManager.register('indexChanged', this, this.indexChanged)
  this.codeManager.register('codeChanged', this, this.codeChanged)
  this.codeManager.register('loadingCode', this, function (address) {})
  this.parent.register('indexChanged', this, function (index) {
    self.codeManager.resolveStep(index, self.parent.tx)
  })
}

ASMCode.prototype.indexChanged = function (index) {
  document.getElementById('asmitems').value = index
}

ASMCode.prototype.codeChanged = function (code, address, index) {
  this.code = code
  this.address = address
  this.renderAssemblyItems()
  yo.update(this.view, this.render())
  document.getElementById('asmitems').value = index
}

ASMCode.prototype.renderAssemblyItems = function () {
  if (this.code) {
    this.codeView = this.code.map(function (item, i) {
      return yo`<option key=${i} value=${i}>${item}</option>`
    })
    return this.codeView
  }
}

module.exports = ASMCode
