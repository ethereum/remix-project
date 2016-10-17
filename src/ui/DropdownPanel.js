'use strict'
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var styleDropdown = require('./styles/dropdownPanel')
var style = require('./styles/basicStyles')
var basicStyles = require('./styles/basicStyles')
var Clipboard
if (ui.runInBrowser()) {
  Clipboard = require('clipboard')
}

function DropdownPanel (_name, _raw) {
  this.data
  this.name = _name
  this.view
  this.clipboard
  _raw = _raw === undefined ? false : _raw
  this.raw = _raw
}

DropdownPanel.prototype.update = function (_data) {
  if (!this.view) {
    return
  }
  if (_data) {
    this.data = _data
  }
  this.view.querySelector('.dropdownpanel div.dropdowncontent').innerHTML = ''
  if (!this.raw) {
    var data = JSON.stringify(this.data, null, '\t')
    if (!this.data || data === '[]' || data === '{}') {
      this.data = ['Empty']
    }
    var div = document.createElement('div')
    if (Array.isArray(this.data)) {
      this.data.map(function (item, i) {
        div.appendChild(yo`<div>${item}</div>`)
      })
    } else {
      for (var k in this.data) {
        div.appendChild(yo`<div><div style=${ui.formatCss(basicStyles.truncate, {display: 'inline-block', 'width': '10%'})} >${k}</div><div style=${ui.formatCss(basicStyles.truncate, {display: 'inline-block', 'width': '50%'})} >${this.data[k]}</div></div>`)
      }
    }
    this.view.querySelector('.dropdownpanel div.dropdowncontent').appendChild(div)
    this.view.querySelector('.btn').setAttribute('data-clipboard-text', data)
    if (Clipboard && !this.clipboard) {
      this.clipboard = new Clipboard(this.view.querySelector('.btn'))
    }
  } else {
    this.view.querySelector('.dropdownpanel div.dropdowncontent').appendChild(this.data)
    this.view.querySelector('.btn').style.display = 'none'
  }
}

DropdownPanel.prototype.render = function (overridestyle) {
  overridestyle === undefined ? {} : overridestyle
  var self = this
  var view = yo`<div>
    <div style=${ui.formatCss(styleDropdown.title)}>
      <div onclick=${function () { self.toggle() }} style=${ui.formatCss(styleDropdown.inner, styleDropdown.titleInner)}>${this.name}</div>
    </div>
    <div class='dropdownpanel' style=${ui.formatCss(styleDropdown.content)} style='display:none'>
      <button style=${ui.formatCss(style.button, styleDropdown.copyBtn)} class="btn" type="button">
        Copy to clipboard
      </button>
      <div style=${ui.formatCss(styleDropdown.inner, overridestyle)} class='dropdowncontent'><div>Empty</div></div>
    </div>
    </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

DropdownPanel.prototype.toggle = function () {
  var el = this.view.querySelector('.dropdownpanel')
  if (el.style.display === '') {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

module.exports = DropdownPanel
