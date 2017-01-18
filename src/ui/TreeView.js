'use strict'
var yo = require('yo-yo')
var style = require('./styles/treeView')
var ui = require('../helpers/ui')

class TreeView {

  constructor (opts) {
    function noop (node) {
    }
    this.beforeJsonNodeRendered = opts.beforeJsonNodeRendered || noop
    this.beforeJsonValueRendered = opts.beforeJsonValueRendered || noop
    this.view = null
    this.cssLabel = ui.formatCss(opts.css || {}, style.label)
    this.cssList = ui.formatCss(opts.css || {}, style.list)
  }

  render (json) {
    var view = yo`<div>${this.renderProperties(json, true)}</div>`
    if (!this.view) {
      this.view = view
    }
    return view
  }

  update (json) {
    if (this.view) {
      yo.update(this.view, this.render(json), {onBeforeElUpdated: (fromEl, toEl) => {
        toEl.style.display = fromEl.style.display
        toEl.className = fromEl.className
        return true
      }})
    }
  }

  renderObject (item, key, expand) {
    var label
    if (item instanceof Array || item instanceof Object) {
      var properties = this.renderProperties(item, false)
      label = yo`<span style=${this.cssLabel}><label style='width: 10px' id='caret'></label><label>${key} - ${properties.length} items</label></span>`
      var list = yo`<ul style=${this.cssList}>${properties}</ol>`
      list.style.display = expand ? 'block' : 'none'
      label.firstElementChild.className = expand ? 'fa fa-caret-down' : 'fa fa-caret-right'
      label.onclick = function () {
        this.firstElementChild.className = this.firstElementChild.className === 'fa fa-caret-right' ? 'fa fa-caret-down' : 'fa fa-caret-right'
        var list = this.parentElement.querySelector('ul')
        list.style.display = list.style.display === 'none' ? 'block' : 'none'
      }
      if (this.beforeJsonNodeRendered) {
        this.beforeJsonNodeRendered(label, item, key)
      }
      return yo`<li style=${this.cssList}>${label}${list}</li>`
    } else {
      label = yo`<label style=${this.cssLabel}>${key}</label>`
      if (this.beforeJsonValueRendered) {
        this.beforeJsonValueRendered(label, item, key)
      }
      return yo`<li style=${this.cssList}>${label}: <span style=${this.cssLabel} >${item}</span></li>`
    }
  }

  renderProperties (json, expand) {
    var properties = Object.keys(json).map((innerkey) => {
      return this.renderObject(json[innerkey], innerkey, expand)
    })
    return properties
  }
}

module.exports = TreeView
