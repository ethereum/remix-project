'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var ui = require('./helpers/ui')

function BasicPanel (_name, _id, _width, _height) {
  this.data
  this.name = _name
  this.id = _id
  this.width = _width
  this.height = _height
  this.view
}

BasicPanel.prototype.update = function () {
  yo.update(this.view, this.render())
}

BasicPanel.prototype.hide = function () {
  document.getElementById(this.id + 'container').style.display = 'none'
}

BasicPanel.prototype.show = function () {
  document.getElementById(this.id + 'container').style.display = 'block'
}

BasicPanel.prototype.render = function () {
  var view = yo`<div id='${this.id}container' style=${ui.formatCss({'width': this.width}, style.panel.container)}>
    <div style=${ui.formatCss(style.panel.title)}>
      ${this.name}
    </div>
      <div style=${ui.formatCss({'height': this.height}, style.panel.tableContainer)}>
      <pre style=${ui.formatCss(style.panel.table, style.font)} id='basicpanel' >${this.data}</pre>
    </div>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = BasicPanel
