'use strict'
var style = require('./styles/basicStyles')
var yo = require('yo-yo')
var ui = require('./helpers/ui')

function BasicPanel (_name) {
  this.data
  this.name = _name

  this.view
}

BasicPanel.prototype.update = function () {
  yo.update(this.view, this.render())
}

BasicPanel.prototype.render = function () {
  var view = yo`<div style=${ui.formatCss(style.panel.container)}>
    <div style=${ui.formatCss(style.panel.title)}>
      ${this.name}
    </div>
    <div style=${ui.formatCss(style.panel.tableContainer)}>
      <pre style=${ui.formatCss(style.panel.table, style.font)} >${this.data}</pre>
    </div>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = BasicPanel
