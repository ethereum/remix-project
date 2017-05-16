'use strict'
var yo = require('yo-yo')
var style = require('./styles/treeView')
var ui = require('../helpers/ui')

class TreeView {

  constructor (opts) {
    this.extractData = opts.extractData || this.extractDataDefault
    this.formatSelf = opts.formatSelf || this.formatSelfDefault
    this.view = null
    this.cssLabel = ui.formatCss(opts.css || {}, style.label)
    this.cssUl = ui.formatCss(opts.css || {}, style.cssUl)
    this.cssLi = ui.formatCss(opts.css || {}, style.cssLi)
    this.nodeIsExpanded = {}
  }

  render (json) {
    var view = this.renderProperties(json, false)
    if (!this.view) {
      this.view = view
    }
    return view
  }

  update (json) {
    if (this.view) {
      yo.update(this.view, this.render(json))
    }
  }

  renderObject (item, parent, key, expand, keyPath) {
    var data = this.extractData(item, parent, key)
    var children = (data.children || []).map((child, index) => {
      return this.renderObject(child.value, data, child.key, expand, keyPath + ',' + child.key)
    })
    return this.formatData(key, data, children, expand, keyPath)
  }

  renderProperties (json, expand) {
    var children = Object.keys(json).map((innerkey) => {
      return this.renderObject(json[innerkey], json, innerkey, expand, innerkey)
    })
    return yo`<ul style=${this.cssUl}>${children}</ul>`
  }

  formatData (key, data, children, expand, keyPath) {
    var label = yo`<div style=${this.cssLabel}><div class="fa fa-caret-right" style=${ui.formatCss(style.caret)}></div><span style=${ui.formatCss(style.data)}>${this.formatSelf(key, data)}</span></div>`
    var renderedChildren = ''
    if (children.length) {
      renderedChildren = yo`<ul style=${this.cssUl}>${children}</ul>`
      renderedChildren.style.display = this.nodeIsExpanded[keyPath] !== undefined ? (this.nodeIsExpanded[keyPath] ? 'block' : 'none') : (expand ? 'block' : 'none')
      label.firstElementChild.className = renderedChildren.style.display === 'none' ? 'fa fa-caret-right' : 'fa fa-caret-down'
      var self = this
      label.onclick = function () {
        this.firstElementChild.className = this.firstElementChild.className === 'fa fa-caret-right' ? 'fa fa-caret-down' : 'fa fa-caret-right'
        var list = this.parentElement.querySelector('ul')
        list.style.display = list.style.display === 'none' ? 'block' : 'none'
        self.nodeIsExpanded[keyPath] = list.style.display === 'block'
      }
    } else {
      label.firstElementChild.style.visibility = 'hidden'
    }
    return yo`<li style=${this.cssLi}>${label}${renderedChildren}</li>`
  }

  formatSelfDefault (key, data) {
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
