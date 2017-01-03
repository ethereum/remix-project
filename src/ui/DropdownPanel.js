'use strict'
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var styleDropdown = require('./styles/dropdownPanel')
var basicStyles = require('./styles/basicStyles')

function DropdownPanel (_name, _raw) {
  this.data
  this.name = _name
  this.view
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
        var content = typeof this.data[k] === 'string' ? this.data[k] : JSON.stringify(this.data[k])
        div.appendChild(yo`<div><div title=${k} style=${ui.formatCss(basicStyles.truncate, {display: 'inline-block', 'width': '10%'})} >${k}</div><div title=${content} style=${ui.formatCss(basicStyles.truncate, {display: 'inline-block', 'width': '78%'})} >${content}</div></div>`)
      }
    }
    this.view.querySelector('.dropdownpanel div.dropdowncontent').appendChild(div)
    this.view.querySelector('.dropdownpanel button.btn').style.display = 'block'
    this.view.querySelector('.dropdownpanel .dropdownrawcontent').innerText = data
  } else {
    this.view.querySelector('.dropdownpanel div.dropdowncontent').appendChild(this.data)
    this.view.querySelector('.dropdownpanel button.btn').style.display = 'none'
  }
}

DropdownPanel.prototype.render = function (overridestyle) {
  overridestyle === undefined ? {} : overridestyle
  var self = this
  var view = yo`<div>
    <div class='title' style=${ui.formatCss(styleDropdown.title)} onclick=${function () { self.toggle() }}>
      <div style=${ui.formatCss(styleDropdown.inner, styleDropdown.titleInner)}>${this.name}</div>
    </div>
    <div class='dropdownpanel' style=${ui.formatCss(styleDropdown.content)} style='display:none'>
      <button onclick=${function () { self.toggleRaw() }} style=${ui.formatCss(basicStyles.button, styleDropdown.copyBtn)} title='raw' class="btn fa fa-eye" type="button">
      </button>
      <div style=${ui.formatCss(styleDropdown.inner, overridestyle)} class='dropdowncontent'><div>Empty</div></div>
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
  if (el.style.display === '') {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

DropdownPanel.prototype.hide = function () {
  var el = this.view.querySelector('.dropdownpanel')
  el.style.display = 'none'
}

DropdownPanel.prototype.show = function () {
  var el = this.view.querySelector('.dropdownpanel')
  el.style.display = ''
}

module.exports = DropdownPanel
