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
    width: 10px;
    flex-shrink: 0;
  }
  .label_tv {
    align-items: center;
  }
  .label_tv>span {
    word-break: break-word;
  }
`

var EventManager = require('../../lib/events')

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
    this.expandPath = []
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

  renderProperties (json, expand, key) {
    key = key || ''
    var children = Object.keys(json).map((innerkey) => {
      return this.renderObject(json[innerkey], json, innerkey, expand, innerkey)
    })
    return yo`<ul key=${key} data-id="treeViewUl${key}" class="${css.ul_tv}">${children}</ul>`
  }

  formatData (key, data, children, expand, keyPath) {
    var self = this
    var li = yo`<li key=${keyPath} data-id="treeViewLi${keyPath}" class=${css.li_tv}></li>`
    var caret = yo`<div class="fas fa-caret-right caret ${css.caret_tv}"></div>`
    var label = yo`
      <div key=${keyPath} data-id="treeViewDiv${keyPath}" class=${css.label_tv}>
        ${caret}
        <span>${self.formatSelf(key, data, li)}</span>
      </div>`
    const expanded = self.expandPath.includes(keyPath)
    li.appendChild(label)
    if (data.children) {
      var list = yo`<ul key=${keyPath} data-id="treeViewUlList${keyPath}" class=${css.ul_tv}>${children}</ul>`
      list.style.display = expanded ? 'block' : 'none'
      caret.className = list.style.display === 'none' ? `fas fa-caret-right caret ${css.caret_tv}` : `fas fa-caret-down caret ${css.caret_tv}`
      caret.setAttribute('data-id', `treeViewToggle${keyPath}`)
      label.onclick = function () {
        self.expand(keyPath)
        if (self.isExpanded(keyPath)) {
          if (!self.expandPath.includes(keyPath)) self.expandPath.push(keyPath)
        } else {
          self.expandPath = self.expandPath.filter(path => path !== keyPath)
        }
      }
      label.oncontextmenu = function (event) {
        self.event.trigger('nodeRightClick', [keyPath, data, label, event])
      }
      li.appendChild(list)
    } else {
      caret.style.visibility = 'hidden'
      label.oncontextmenu = function (event) {
        self.event.trigger('leafRightClick', [keyPath, data, label, event])
      }
      label.onclick = function (event) {
        self.event.trigger('leafClick', [keyPath, data, label, event])
      }
    }
    return li
  }

  isExpanded (path) {
    var current = this.nodeAt(path)
    if (current) {
      return current.style.display !== 'none'
    }
    return false
  }

  expand (path) {
    var caret = this.caretAt(path)
    var node = this.nodeAt(path)
    if (node) {
      node.style.display = node.style.display === 'none' ? 'block' : 'none'
      caret.className = node.style.display === 'none' ? `fas fa-caret-right caret ${css.caret_tv}` : `fas fa-caret-down caret ${css.caret_tv}`
      this.event.trigger('nodeClick', [path, node])
    }
  }

  caretAt (path) {
    var label = this.labelAt(path)
    if (label) {
      return label.querySelector('.caret')
    }
  }

  itemAt (path) {
    return this.view.querySelector(`li[key="${path}"]`)
  }

  labelAt (path) {
    return this.view.querySelector(`div[key="${path}"]`)
  }

  nodeAt (path) {
    return this.view.querySelector(`ul[key="${path}"]`)
  }

  updateNodeFromJSON (path, jsonTree, expand) {
    var newTree = this.renderProperties(jsonTree, expand, path)
    var current = this.nodeAt(path)
    if (current && current.parentElement) {
      current.parentElement.replaceChild(newTree, current)
    }
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
      ret.children = null
      ret.isNode = false
      ret.isLeaf = true
    }
    return ret
  }
}

module.exports = TreeView
