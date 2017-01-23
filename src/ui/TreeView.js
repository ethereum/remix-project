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
    this.extractProperties = opts.extractProperties || this.extractPropertiesDefault
    this.view = null
    this.cssLabel = ui.formatCss(opts.css || {}, style.label)
    this.cssUl = ui.formatCss(opts.css || {}, style.cssUl)
    this.cssLi = ui.formatCss(opts.css || {}, style.cssLi)
  }

  render (json) {
    var view = this.renderProperties(json, true)
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
    var children = (data.children || []).map((child, index) => {
      return this.renderObject(child.value, data, child.key, expand)
    })
    return this.formatDataInternal(key, data, children, expand)
  }

  renderProperties (json, expand) {
    var children = Object.keys(json).map((innerkey) => {
      return this.renderObject(json[innerkey], json, innerkey, expand)
    })
    return yo`<ul style=${this.cssUl}>${children}</ul>`
  }

  formatDataInternal (key, data, children, expand) {
    var label = yo`<span style=${this.cssLabel}><label style=${ui.formatCss(style.caret)}></label><span style=${ui.formatCss(style.data)}>${this.formatData(key, data)}</span></span>`
    var renderedChildren = ''
    if (children.length) {
      renderedChildren = yo`<ul style=${this.cssUl}>${children}</ul>`
      renderedChildren.style.display = expand ? 'block' : 'none'
      label.firstElementChild.className = expand ? 'fa fa-caret-down' : 'fa fa-caret-right'
      label.onclick = function () {
        this.firstElementChild.className = this.firstElementChild.className === 'fa fa-caret-right' ? 'fa fa-caret-down' : 'fa fa-caret-right'
        var list = this.parentElement.querySelector('ul')
        list.style.display = list.style.display === 'none' ? 'block' : 'none'
      }
    }
    return yo`<li id=${key + (new Date().getUTCMilliseconds())} style=${this.cssLi}>${label}${renderedChildren}</li>`
  }

  extractPropertiesDefault (key, data) {
    return {}
  }

  formatDataDefault (key, data) {
    return yo`<label>${key}: ${data.self}</label>`
  }

  extractDataDefault (item, parent, key) {
    var ret = {}
    if (item instanceof Array) {
      ret.children = item.map((item, index) => {
        return {key: index, value: item}
      })
      ret.self = 'Array'
    } else if (item instanceof Object) {
      ret.children = Object.keys(item).map((key) => {
        return {key: key, value: item[key]}
      })
      ret.self = 'Object'
    } else {
      ret.self = item
      ret.children = []
    }
    return ret
  }
}

module.exports = TreeView
