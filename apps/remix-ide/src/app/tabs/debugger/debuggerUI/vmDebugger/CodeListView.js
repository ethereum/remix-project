'use strict'
var style = require('../styles/basicStyles')
var yo = require('yo-yo')
var DropdownPanel = require('./DropdownPanel')
var EventManager = require('../../../../../lib/events')
var csjs = require('csjs-inject')

var css = csjs`
  .instructions {
    overflow-y: scroll;
    max-height: 150px;
  }
`
function CodeListView () {
  this.event = new EventManager()
  this.code
  this.address
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
  this.view = yo`<div id='asmcodes' >${this.basicPanel.render({height: style.instructionsList.height})}</div>`
  return this.view
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
  let codeView = this.view.querySelector('#asmitems')
  this.itemSelected = codeView.children[index]
  this.itemSelected.style.setProperty('background-color', 'var(--info)')
  this.itemSelected.style.setProperty('color', 'var(--light)')
  this.itemSelected.setAttribute('selected', 'selected')
  if (this.itemSelected.firstChild) {
    this.itemSelected.firstChild.setAttribute('style', 'margin-left: 2px')
  }
  codeView.scrollTop = this.itemSelected.offsetTop - parseInt(codeView.offsetTop)
}

CodeListView.prototype.reset = function () {
  this.changed([], '', -1)
}

CodeListView.prototype.changed = function (code, address, index) {
  if (this.address === address) {
    return this.indexChanged(index)
  }
  this.code = code
  this.address = address
  this.basicPanel.setContent(this.renderAssemblyItems())
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
