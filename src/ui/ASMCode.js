'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var ui = require('../helpers/ui')

function ASMCode (_parent, _codeManager) {
  this.parent = _parent
  this.codeManager = _codeManager
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
  this.codeManager.event.register('changed', this, this.changed)
}

ASMCode.prototype.indexChanged = function (index) {
  document.getElementById('asmitems').value = index
}

ASMCode.prototype.changed = function (code, address, index) {
  if (this.address !== address) {
    this.code = code
    this.address = address
    this.renderAssemblyItems()
    yo.update(this.view, this.render())
  }
  this.indexChanged(index)
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
