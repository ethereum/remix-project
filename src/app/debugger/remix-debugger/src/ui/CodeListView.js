'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var DropdownPanel = require('./DropdownPanel')
var EventManager = remixLib.EventManager
var csjs = require('csjs-inject')
var styleGuide = require('../../../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .instructions {
    ${styles.rightPanel.debuggerTab.box_Debugger}
    width: 75%;
    overflow-y: scroll;
    max-height: 250px;
  }
`
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
    this.itemSelected.setAttribute('style', 'background-color: ' + styles.rightPanel.debuggerTab.text_BgHighlight)
    this.itemSelected.setAttribute('selected', 'selected')
    if (this.itemSelected.firstChild) {
      this.itemSelected.firstChild.setAttribute('style', 'margin-left: 2px')
    }
    this.codeView.scrollTop = this.itemSelected.offsetTop - parseInt(this.codeView.offsetTop)
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
    return yo`<div class=${css.instructions} id='asmitems' ref='itemsList'>
      ${codeView}
    </div>`
  }
}

module.exports = CodeListView
