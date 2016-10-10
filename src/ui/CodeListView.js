'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var DropdownPanel = require('./DropdownPanel')

function CodeListView (_parent, _codeManager) {
  this.parent = _parent
  this.codeManager = _codeManager
  this.code
  this.address
  this.codeView
  this.itemSelected
  this.basicPanel = new DropdownPanel('Assembly', true)
  this.init()
}

CodeListView.prototype.render = function () {
  return yo`<div id='asmcodes' >${this.basicPanel.render({height: style.instructionsList.height})}</div>`
}

CodeListView.prototype.init = function () {
  var self = this
  this.codeManager.register('changed', this, this.changed)
  this.parent.register('traceUnloaded', this, function () {
    self.changed([], '', -1)
  })
}

CodeListView.prototype.indexChanged = function (index) {
  if (index >= 0) {
    if (this.itemSelected) {
      this.itemSelected.removeAttribute('selected')
      this.itemSelected.removeAttribute('style')
      this.itemSelected.firstChild.removeAttribute('style')
    }
    this.itemSelected = this.codeView.children[index]
    this.itemSelected.setAttribute('style', ui.formatCss({'background-color': '#eeeeee'}))
    this.itemSelected.setAttribute('selected', 'selected')
    this.itemSelected.firstChild.setAttribute('style', ui.formatCss({'margin-left': '2px'}))
    this.codeView.scrollTop = this.itemSelected.offsetTop - parseInt(this.codeView.offsetHeight)
  }
}

CodeListView.prototype.changed = function (code, address, index) {
  if (this.address !== address) {
    this.code = code
    this.address = address
    this.codeView = this.renderAssemblyItems()
    this.basicPanel.data = this.codeView
    this.basicPanel.update()
  }
  this.indexChanged(index)
}

CodeListView.prototype.renderAssemblyItems = function () {
  if (this.code) {
    var codeView = this.code.map(function (item, i) {
      return yo`<li key=${i} value=${i}><span>${item}</span></li>`
    })
    return yo`<ul id='asmitems' ref='itemsList' style=${ui.formatCss(style.instructionsList)}>
      ${codeView}
    </ul>`
  }
}

module.exports = CodeListView
