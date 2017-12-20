'use strict'
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var css = csjs`
  .li_tv {
    list-style-type: none;
    -webkit-margin-before: 0px;
    -webkit-margin-after: 0px;
    -webkit-margin-start: 0px;
    -webkit-margin-end: 0px;
    -webkit-padding-start: 0px;
    margin-left: 10px;
  }
  .ul_tv {
    list-style-type: none;
    -webkit-margin-before: 0px;
    -webkit-margin-after: 0px;
    -webkit-margin-start: 0px;
    -webkit-margin-end: 0px;
    -webkit-padding-start: 0px;
    margin-left: 10px;
  }
  .caret_tv {
    margin-top: 3px;
    width: 10px;
  }
`

var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

class TreeView {

  constructor (opts) {
    this.event = new EventManager()
    this.extractData = opts.extractData || this.extractDataDefault
    this.formatSelf = opts.formatSelf || this.formatSelfDefault
    this.view = null
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
      return this.renderObject(child.value, data, child.key, expand, keyPath + '/' + child.key)
    })
    return this.formatData(key, data, children, expand, keyPath)
  }

  renderProperties (json, expand) {
    var children = Object.keys(json).map((innerkey) => {
      return this.renderObject(json[innerkey], json, innerkey, expand, innerkey)
    })
    return yo`<ul class="${css.ul_tv}">${children}</ul>`
  }

  formatData (key, data, children, expand, keyPath) {
    var label = yo`<div class=${css.label_tv}><div class="fa fa-caret-right" class=${css.caret_tv}></div><span>${this.formatSelf(key, data)}</span></div>`
    var renderedChildren = null
    if (data.isNode || children.length) {
      renderedChildren = yo`<ul class=${this.ul_tv}>${children}</ul>`
      renderedChildren.style.display = this.nodeIsExpanded[keyPath] !== undefined ? (this.nodeIsExpanded[keyPath] ? 'block' : 'none') : (expand ? 'block' : 'none')
      label.firstElementChild.className = renderedChildren.style.display === 'none' ? 'fa fa-caret-right' : 'fa fa-caret-down'
      if (children.length) {
        var self = this
        label.onclick = function () {
          this.firstElementChild.className = this.firstElementChild.className === 'fa fa-caret-right' ? 'fa fa-caret-down' : 'fa fa-caret-right'
          var list = this.parentElement.querySelector('ul')
          list.style.display = list.style.display === 'none' ? 'block' : 'none'
          self.nodeIsExpanded[keyPath] = list.style.display === 'block'
        }
      } else {
        label.onclick = () => {
          this.event.trigger('nodeClick', [keyPath, renderedChildren])
        }
      }
    } else {
      label.firstElementChild.style.visibility = 'hidden'
      label.onclick = () => {
        this.event.trigger('leafClick', [keyPath, renderedChildren])
      }
    }
    return yo`<li class=${css.li_tv}>${label}${renderedChildren}</li>`
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
      ret.isNode = true
      ret.isLeaf = false
    } else if (item instanceof Object) {
      ret.children = Object.keys(item).map((key) => {
        return {key: key, value: item[key]}
      })
      ret.self = 'Object'
      ret.isNode = true
      ret.isLeaf = false
    } else {
      ret.self = item
      ret.children = []
      ret.isNode = false
      ret.isLeaf = true
    }
    return ret
  }
}

module.exports = TreeView
