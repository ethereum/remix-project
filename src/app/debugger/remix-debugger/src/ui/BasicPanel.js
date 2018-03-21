'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var ui = remixLib.helpers.ui

var csjs = require('csjs-inject')

var css = csjs`
  .container {
    width: 70%;
  }
`

function BasicPanel (_name, _width, _height) {
  this.data
  this.name = _name
  this.width = _width
  this.height = _height
  this.view
}

BasicPanel.prototype.update = function () {
  yo.update(this.view, this.render())
}

BasicPanel.prototype.hide = function () {
  this.view.style.display = 'none'
}

BasicPanel.prototype.show = function () {
  this.view.style.display = 'block'
}

BasicPanel.prototype.render = function () {
  var view = yo`
    <div css=${css.container} id='container' style=${ui.formatCss({'width': this.width})}>
    <div style=${ui.formatCss(style.panel.title)}>
      ${this.name}
    </div>
      <div style=${ui.formatCss({'height': this.height}, style.panel.tableContainer)}>
      <pre style=${ui.formatCss({'width': this.width}, style.panel.table, style.font)} id='basicpanel' >${this.data}</pre>
    </div>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = BasicPanel
