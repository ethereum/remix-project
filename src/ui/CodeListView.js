'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var DropdownPanel = require('./DropdownPanel')
var EventManager = require('../lib/eventManager')

function CodeListView (_parent, _codeManager) {
  this.event = new EventManager()
  this.parent = _parent
  this.codeManager = _codeManager
  this.code
  this.address
  this.codeView
  this.itemSelected
  this.basicPanel = new DropdownPanel('Instructions', {json: false})
  this.basicPanel.event.register('hide', () => {
    this.event.trigger('hide', [])
  })
  this.basicPanel.event.register('show', () => {
    this.event.trigger('show', [])
  })
  this.init()
}

CodeListView.prototype.render = function () {
  return yo`<div id='asmcodes' >${this.basicPanel.render({height: style.instructionsList.height})}</div>`
}

CodeListView.prototype.init = function () {
  var self = this
  this.codeManager.event.register('changed', this, this.changed)
  this.parent.event.register('traceUnloaded', this, function () {
    self.changed([], '', -1)
  })
}

CodeListView.prototype.indexChanged = function (index) {
  if (index >= 0) {
    if (this.itemSelected) {
      this.itemSelected.removeAttribute('selected')
      this.itemSelected.removeAttribute('style')
      if (this.itemSelected.firstChild) {
        this.itemSelected.firstChild.removeAttribute('style')
      }
    }
    this.itemSelected = this.codeView.children[index]
    this.itemSelected.setAttribute('style', ui.formatCss({'background-color': '#eeeeee'}))
    this.itemSelected.setAttribute('selected', 'selected')
    if (this.itemSelected.firstChild) {
      this.itemSelected.firstChild.setAttribute('style', ui.formatCss({'margin-left': '2px'}))
    }
    this.codeView.scrollTop = this.itemSelected.offsetTop - parseInt(this.codeView.offsetHeight)
  }
}

CodeListView.prototype.changed = function (code, address, index) {
  if (this.address !== address) {
    this.code = code
    this.address = address
    this.codeView = this.renderAssemblyItems()
    this.basicPanel.setContent(this.codeView)
  }
  this.indexChanged(index)
}

CodeListView.prototype.renderAssemblyItems = function () {
  if (this.code) {
    var codeView = this.code.map(function (item, i) {
      return yo`<div key=${i} value=${i}><span>${item}</span></div>`
    })
    return yo`<div id='asmitems' ref='itemsList' style=${ui.formatCss(style.instructionsList)}>
      ${codeView}
    </div>`
  }
}

module.exports = CodeListView
