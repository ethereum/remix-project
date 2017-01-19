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
    this.extractData = opts.extractData || this.extractDataDefault
    this.formatData = opts.formatData || this.formatDataDefault
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

  renderObject (item, parent, key, expand) {
    var data = this.extractData(item, parent, key)
    var children = Object.keys(data.children).map((innerkey) => {
      return this.renderObject(data.children[innerkey], data, innerkey, expand)
    })
    return this.formatDataInternal(key, data, children, expand)
  }

  renderProperties (json, expand) {
    var children = Object.keys(json).map((innerkey) => {
      return this.renderObject(json[innerkey], json, innerkey, expand)
    })
    return yo`<ul style=${this.cssList}>${children}</ul>`
  }

  formatDataInternal (key, data, children, expand) {
    var label = yo`<span style=${this.cssLabel}><label style='position:absolute;margin-top: 2px'></label><span style='margin-left: 10px'>${this.formatData(key, data)}</span></span>`
    var renderedChildren = ''
    if (children.length) {
      renderedChildren = yo`<ul style=${this.cssList}>${children}</ul>`
      renderedChildren.style.display = expand ? 'block' : 'none'
      label.firstElementChild.className = expand ? 'fa fa-caret-down' : 'fa fa-caret-right'
      label.onclick = function () {
        this.firstElementChild.className = this.firstElementChild.className === 'fa fa-caret-right' ? 'fa fa-caret-down' : 'fa fa-caret-right'
        var list = this.parentElement.querySelector('ul')
        list.style.display = list.style.display === 'none' ? 'block' : 'none'
      }
    }
    return yo`<li style=${this.cssList}>${label}${renderedChildren}</li>`
  }

  formatDataDefault (key, data) {
    return yo`<label>${key}: ${data.self}</label>`
  }

  extractDataDefault (item, parent, key) {
    var ret = {}
    if (item instanceof Array) {
      ret.children = item
      ret.self = 'Array'
    } else if (item instanceof Object) {
      ret.children = item
      ret.self = 'Object'
    } else {
      ret.self = item
      ret.children = []
    }
    return ret
  }
}

module.exports = TreeView
