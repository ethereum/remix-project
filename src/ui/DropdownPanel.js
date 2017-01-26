'use strict'
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var styleDropdown = require('./styles/dropdownPanel')
var basicStyles = require('./styles/basicStyles')
var TreeView = require('./TreeView')
var EventManager = require('../lib/eventManager')

function DropdownPanel (_name, _opts) {
  this.event = new EventManager()
  if (!_opts) {
    _opts = {}
  }
  this.name = _name
  this.json = _opts.json
  if (this.json) {
    this.treeView = new TreeView(_opts)
  }
  this.view
}

DropdownPanel.prototype.update = function (_data) {
  if (this.view) {
    this.view.querySelector('.dropdownpanel .dropdownrawcontent').innerText = JSON.stringify(_data, null, '\t')
    this.view.querySelector('.dropdownpanel button.btn').style.display = 'block'
    if (this.json) {
      this.treeView.update(_data)
    }
  }
}

DropdownPanel.prototype.setContent = function (node) {
  var parent = this.view.querySelector('.dropdownpanel div.dropdowncontent')
  parent.replaceChild(node, parent.firstElementChild)
}

DropdownPanel.prototype.render = function (overridestyle) {
  var content = yo`<div>Empty</div>`
  if (this.json) {
    content = this.treeView.render({})
  }
  overridestyle === undefined ? {} : overridestyle
  var self = this
  var view = yo`<div>
    <div class='title' style=${ui.formatCss(styleDropdown.title)} onclick=${function () { self.toggle() }}>
      <div style=${ui.formatCss(styleDropdown.caret)} class='fa fa-caret-right'></div>
      <div style=${ui.formatCss(styleDropdown.inner, styleDropdown.titleInner)}>${this.name}</div>
    </div>
    <div class='dropdownpanel' style=${ui.formatCss(styleDropdown.content)} style='display:none'>
      <button onclick=${function () { self.toggleRaw() }} style=${ui.formatCss(basicStyles.button, styleDropdown.copyBtn)} title='raw' class="btn fa fa-eye" type="button">
      </button>
      <div style=${ui.formatCss(styleDropdown.inner, overridestyle)} class='dropdowncontent'>${content}</div>
      <div style=${ui.formatCss(styleDropdown.inner, overridestyle)} class='dropdownrawcontent' style='display:none'></div>
    </div>
    </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

DropdownPanel.prototype.toggleRaw = function () {
  var raw = this.view.querySelector('.dropdownpanel .dropdownrawcontent')
  var formatted = this.view.querySelector('.dropdownpanel .dropdowncontent')
  raw.style.display = raw.style.display === 'none' ? 'block' : 'none'
  formatted.style.display = formatted.style.display === 'none' ? 'block' : 'none'
}

DropdownPanel.prototype.toggle = function () {
  var el = this.view.querySelector('.dropdownpanel')
  var caret = this.view.querySelector('.title').firstElementChild
  if (el.style.display === '') {
    el.style.display = 'none'
    caret.className = 'fa fa-caret-right'
  } else {
    el.style.display = ''
    caret.className = 'fa fa-caret-down'
  }
}

DropdownPanel.prototype.hide = function () {
  if (this.view) {
    var caret = this.view.querySelector('.title').firstElementChild
    var el = this.view.querySelector('.dropdownpanel')
    el.style.display = 'none'
    caret.className = 'fa fa-caret-right'
    this.event.trigger('hide', [])
  }
}

DropdownPanel.prototype.show = function () {
  if (this.view) {
    var caret = this.view.querySelector('.title').firstElementChild
    var el = this.view.querySelector('.dropdownpanel')
    el.style.display = ''
    caret.className = 'fa fa-caret-down'
    this.event.trigger('show', [])
  }
}

module.exports = DropdownPanel
