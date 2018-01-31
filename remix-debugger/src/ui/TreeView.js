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
  }
  .caret_tv {
    margin-top: 3px;
    width: 10px;
  }
  .label_tv {
    display: flex;
    align-items: center;
  }
`

var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

/**
 * TreeView
 *  - extendable by specifying custom `extractData` and `formatSelf` function
 *  - trigger `nodeClick` and `leafClick`
 */
class TreeView {

  constructor (opts) {
    this.event = new EventManager()
    this.extractData = opts.extractData || this.extractDataDefault
    this.formatSelf = opts.formatSelf || this.formatSelfDefault
    this.view = null
    this.nodes = {}
    this.labels = {}
    this.carets = {}
  }

  render (json, expand) {
    var view = this.renderProperties(json, expand)
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
    var self = this
    var li = yo`<li class=${css.li_tv}></li>`
    var caret = yo`<div class="fa fa-caret-right ${css.caret_tv}"></div>`
    var label = yo`
      <div class=${css.label_tv}>
        ${caret}
        <span>${self.formatSelf(key, data, li)}</span>
      </div>`
    li.appendChild(label)
    if (data.children) {
      var list = yo`<ul class=${css.ul_tv}>${children}</ul>`
      this.nodes[keyPath] = list
      this.labels[keyPath] = label
      this.carets[keyPath] = caret
      list.style.display = 'none'
      caret.className = list.style.display === 'none' ? 'fa fa-caret-right' : 'fa fa-caret-down'
      label.onclick = function () {
        self.expand(keyPath)
      }
      li.appendChild(list)
    } else {
      caret.style.visibility = 'hidden'
    }
    return li
  }

  expand (path) {
    if (this.labels[path]) {
      this.carets[path].className = this.carets[path].className === 'fa fa-caret-right' ? 'fa fa-caret-down' : 'fa fa-caret-right'
      this.nodes[path].style.display = this.nodes[path].style.display === 'none' ? 'block' : 'none'
      this.event.trigger('nodeClick', [path, this.nodes[path]])
    }
  }

  nodeAt (path) {
    return this.nodes[path]
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
