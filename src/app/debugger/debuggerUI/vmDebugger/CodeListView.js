'use strict'
var style = require('../../remix-debugger/src/ui/styles/basicStyles')
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var DropdownPanel = require('./DropdownPanel')
var EventManager = remixLib.EventManager
var csjs = require('csjs-inject')
var styleGuide = require('../../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .instructions {
    ${styles.rightPanel.debuggerTab.box_Debugger}
    overflow-y: scroll;
    max-height: 150px;
  }
`
function CodeListView () {
  this.event = new EventManager()
  this.code
  this.address
  this.codeView
  this.itemSelected
  this.basicPanel = new DropdownPanel('Instructions', {json: false, displayContentOnly: true})
  this.basicPanel.event.register('hide', () => {
    this.event.trigger('hide', [])
  })
  this.basicPanel.event.register('show', () => {
    this.event.trigger('show', [])
  })
}

CodeListView.prototype.render = function () {
  return yo`<div id='asmcodes' >${this.basicPanel.render({height: style.instructionsList.height})}</div>`
}

CodeListView.prototype.indexChanged = function (index) {
  if (index < 0) return
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

CodeListView.prototype.changed = function (code, address, index) {
  if (this.address === address) {
    return this.indexChanged(index)
  }
  this.code = code
  this.address = address
  this.codeView = this.renderAssemblyItems()
  this.basicPanel.setContent(this.codeView)
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
